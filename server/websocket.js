const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const platform = os.platform();
const axios = require('axios');

const TALKBACK_PACKAGE_NAME = 'com.google.android.marvin.talkback';
const PROXY_URL = process.env.ADB_PROXY_URL || 'http://localhost:3080';
const POLL_INTERVAL = 1000; // Poll every 1 second

// Store active capture sessions
const captureSessions = new Map();

const runAdbCommand = async command => {
  try {
    const response = await axios.post(`${PROXY_URL}/run-adb`, {
      command: command
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`ADB command failed: ${error.response.data.error}`);
    } else if (error.request) {
      throw new Error('Unable to connect to ADB proxy');
    } else {
      throw new Error(`Request failed: ${error.message}`);
    }
  }
};

const checkDeviceConnected = async () => {
  const result = await runAdbCommand('devices');
  const lines = result.output
    .split('\n')
    .filter(line => line.trim() && !line.includes('List of devices'));
  return lines.length > 0 && lines.some(line => line.includes('device'));
};

const checkDeveloperMode = async () => {
  const result = await runAdbCommand(
    'shell settings get global development_settings_enabled'
  );
  return result.output.trim() === '1';
};

const checkTalkbackEnabled = async () => {
  const result = await runAdbCommand(
    'shell settings get secure enabled_accessibility_services'
  );
  return result.output.includes(TALKBACK_PACKAGE_NAME);
};

const getTalkbackPid = async () => {
  const result = await runAdbCommand(`shell pidof -s ${TALKBACK_PACKAGE_NAME}`);
  const pid = result.output.trim();
  return pid && !isNaN(pid) ? pid : null;
};

const clearLogcat = async () => {
  await runAdbCommand('logcat -c');
};

const getLogcatDump = async pid => {
  const result = await runAdbCommand(`logcat --pid=${pid} -v threadtime -d`);
  return result.output;
};

const extractUtterances = (logOutput, lastProcessedTime = null) => {
  const lines = logOutput.split('\n');
  const utterances = [];
  let startCapturing = false;

  for (const line of lines) {
    if (!line.trim()) continue;

    // Skip lines before lastProcessedTime if provided
    if (lastProcessedTime) {
      const timeMatch = line.match(/(\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/);
      if (timeMatch) {
        const lineTime = timeMatch[1];
        if (lineTime <= lastProcessedTime) {
          continue;
        }
      }
    }

    // Look for ACTION_CLICK and Run Test Setup in the same line
    if (line.includes('ACTION_CLICK') && line.includes('Run Test Setup')) {
      startCapturing = true;
      continue;
    }

    if (!startCapturing) continue;

    // Check for "End of Example" text
    if (line.includes('End of Example')) {
      startCapturing = false;
      break;
    }

    // Extract text from lines containing "text=" and "utterance"
    if (line.includes('text=') && line.includes('utterance')) {
      const textMatch = line.match(/text="([^"]*)"/);
      if (textMatch && textMatch[1]) {
        utterances.push(textMatch[1]);
      }
    }
  }

  return utterances;
};

const getLastLogTime = logOutput => {
  const lines = logOutput.split('\n').reverse();
  for (const line of lines) {
    const timeMatch = line.match(/(\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/);
    if (timeMatch) {
      return timeMatch[1];
    }
  }
  return null;
};

const startCaptureSession = async (sessionId, ws) => {
  try {
    // Validation checks
    if (!(await checkDeviceConnected())) {
      throw new Error('No Android device connected');
    }

    if (!(await checkDeveloperMode())) {
      throw new Error('Developer mode is not enabled on the device');
    }

    if (!(await checkTalkbackEnabled())) {
      throw new Error('TalkBack is not enabled on the device');
    }

    const pid = await getTalkbackPid();
    if (!pid) {
      throw new Error('TalkBack process not found');
    }

    // Clear logcat buffer
    await clearLogcat();

    console.info(
      `Starting capture session ${sessionId} for TalkBack PID ${pid}`
    );

    // Initialize session state
    const session = {
      pid,
      ws,
      isActive: true,
      lastProcessedTime: null,
      collectedUtterances: [],
      pollInterval: null
    };

    captureSessions.set(sessionId, session);

    // Start polling for logs
    const pollLogs = async () => {
      if (!session.isActive) return;

      try {
        const logOutput = await getLogcatDump(session.pid);
        const newUtterances = extractUtterances(
          logOutput,
          session.lastProcessedTime
        );

        if (newUtterances.length > 0) {
          session.collectedUtterances.push(...newUtterances);

          // Send each utterance to the client
          for (const utterance of newUtterances) {
            if (session.isActive) {
              ws.send(
                JSON.stringify({
                  type: 'utterance',
                  data: utterance
                })
              );
            }
          }
        }

        // Update last processed time
        const lastTime = getLastLogTime(logOutput);
        if (lastTime) {
          session.lastProcessedTime = lastTime;
        }

        // Schedule next poll
        if (session.isActive) {
          session.pollInterval = setTimeout(pollLogs, POLL_INTERVAL);
        }
      } catch (error) {
        console.error('Error polling logs:', error);
        if (session.isActive) {
          ws.send(
            JSON.stringify({
              type: 'error',
              error: error.message
            })
          );
        }
      }
    };

    // Start the polling loop
    pollLogs();

    ws.send(
      JSON.stringify({
        type: 'started',
        message: 'Started capturing utterances'
      })
    );
  } catch (error) {
    console.error('Error starting capture session:', error);
    ws.send(
      JSON.stringify({
        type: 'error',
        error: error.message
      })
    );
  }
};

const stopCaptureSession = sessionId => {
  const session = captureSessions.get(sessionId);
  if (session) {
    session.isActive = false;

    if (session.pollInterval) {
      clearTimeout(session.pollInterval);
      session.pollInterval = null;
    }

    // Send collected utterances
    if (session.collectedUtterances.length > 0) {
      session.ws.send(
        JSON.stringify({
          type: 'utterances_collected',
          data: session.collectedUtterances.join('  ') // Match original format
        })
      );
    }

    session.ws.send(
      JSON.stringify({
        type: 'stopped',
        message: 'Stopped capturing utterances'
      })
    );

    captureSessions.delete(sessionId);
    console.info(`Stopped capture session ${sessionId}`);
  }
};

const setupWebSocketServer = server => {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.info('New WebSocket connection attempt');

    const sessionId = req.url.split('?sessionId=')[1];
    if (!sessionId) {
      console.error('No session ID provided, closing connection');
      ws.close(1008, 'Missing sessionId');
      return;
    }

    console.info(`New WebSocket connection for session ${sessionId}`);

    ws.on('message', async message => {
      console.info(`Raw message: ${message}`);
      try {
        const data = JSON.parse(message);
        console.info('Parsed message data', data);

        if (data.type === 'startCapture') {
          console.info('Starting utterance capture for session', sessionId);

          // If there's already a session running, stop it
          if (captureSessions.has(sessionId)) {
            console.warn('Found existing session, cleaning up...');
            stopCaptureSession(sessionId);
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          await startCaptureSession(sessionId, ws);
        } else if (data.type === 'stopCapture') {
          console.info('Stopping utterance capture for session', sessionId);
          stopCaptureSession(sessionId);
        } else {
          console.warn('Unknown message type', data.type);
        }
      } catch (error) {
        console.error('WebSocket message error', error);
        ws.send(JSON.stringify({ type: 'error', error: error.message }));
      }
    });

    ws.on('close', () => {
      console.info(`WebSocket connection closed for session ${sessionId}`);
      stopCaptureSession(sessionId);
    });

    ws.on('error', error => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
};

module.exports = { setupWebSocketServer };
