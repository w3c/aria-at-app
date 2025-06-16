const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const platform = os.platform();

// Store active capture sessions
const captureSessions = new Map();

const getPlatformSpecificCommand = script => {
  let scriptPath;
  let command = null;

  switch (platform) {
    case 'darwin': // macOS
      scriptPath = path.join(
        __dirname,
        `scripts/talkback-capture/${script}.sh`
      );
      command = `sh ${scriptPath}`;
      break;
    case 'linux':
      scriptPath = path.join(
        __dirname,
        `scripts/talkback-capture/linux/${script}.sh`
      );
      command = `sh ${scriptPath}`;
      break;
    case 'win32':
      scriptPath = path.join(
        __dirname,
        `scripts/talkback-capture/win32/${script}.ps1`
      );
      command = scriptPath;
      break;
    default:
      break;
  }

  // eslint-disable-next-line no-console
  console.info(
    `Platform: ${platform} || Script path: ${scriptPath} || Command: ${command}`
  );
  return command;
};

const setupWebSocketServer = server => {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    // eslint-disable-next-line no-console
    console.info(
      `New WebSocket connection attempt\nConnection URL: ${req.url}\nConnection headers: ${req.headers}`
    );

    const sessionId = req.url.split('?sessionId=')[1];
    if (!sessionId) {
      console.error('No session ID provided, closing connection');
      ws.close(1008, 'Missing sessionId');
      return;
    }

    // eslint-disable-next-line no-console
    console.info(`New WebSocket connection for session ${sessionId}`);

    ws.on('message', async message => {
      // eslint-disable-next-line no-console
      console.info(`Raw message: ${message}`);
      try {
        const data = JSON.parse(message);
        // eslint-disable-next-line no-console
        console.info('Parsed message data', data);

        if (data.type === 'startCapture') {
          // eslint-disable-next-line no-console
          console.info('Starting utterance capture for session', sessionId);

          // If there's already a session running, close it
          if (captureSessions.has(sessionId)) {
            console.warn('Found existing session, cleaning up...');

            const existingSession = captureSessions.get(sessionId);
            existingSession.process.kill('SIGINT');

            await new Promise(resolve => setTimeout(resolve, 1000));
            if (existingSession.process) {
              existingSession.process.kill('SIGKILL');
            }
            captureSessions.delete(sessionId);
          }

          const command = getPlatformSpecificCommand('captureUtterances');
          if (!command) {
            console.error('No command available for platform', platform);
            ws.send(
              JSON.stringify({ type: 'error', error: 'Unsupported platform' })
            );
            return;
          }

          // eslint-disable-next-line no-console
          console.info('Spawning process with command', command);
          const process = spawn(
            command.split(' ')[0],
            command.split(' ').slice(1),
            { shell: true }
          );

          // Store the session
          captureSessions.set(sessionId, { process, ws });
          // eslint-disable-next-line no-console
          console.info('Session stored', Array.from(captureSessions.keys()));

          // Handle process output
          process.stdout.on('data', data => {
            const output = data.toString();

            // eslint-disable-next-line no-console
            console.info('stdout', output);
            ws.send(JSON.stringify({ type: 'utterance', data: output }));
          });

          process.stderr.on('data', data => {
            console.error('process.stderr', data.toString());
          });

          process.on('error', error => {
            console.error('process.error', error);
            ws.send(JSON.stringify({ type: 'error', error: error.message }));
            captureSessions.delete(sessionId);
          });

          process.on('exit', code => {
            console.warn('process.exit', code);
            ws.send(JSON.stringify({ type: 'exit', code }));
            captureSessions.delete(sessionId);
          });

          ws.send(
            JSON.stringify({
              type: 'started',
              message: 'Started capturing utterances'
            })
          );
        } else if (data.type === 'stopCapture') {
          // eslint-disable-next-line no-console
          console.info('Stopping utterance capture for session', sessionId);
          const session = captureSessions.get(sessionId);
          if (session) {
            session.process.kill('SIGINT');
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (session.process) {
              session.process.kill('SIGKILL');
            }
            captureSessions.delete(sessionId);
            ws.send(
              JSON.stringify({
                type: 'stopped',
                message: 'Stopped capturing utterances'
              })
            );
          }
        } else {
          console.warn('Unknown message type', data.type);
        }
      } catch (error) {
        console.error('WebSocket message error', error);
        ws.send(JSON.stringify({ type: 'error', error: error.message }));
      }
    });

    ws.on('close', () => {
      // eslint-disable-next-line no-console
      console.info(`WebSocket connection closed for session ${sessionId}`);

      // Clean up session if it exists
      const session = captureSessions.get(sessionId);
      if (session) {
        // eslint-disable-next-line no-console
        console.info('Cleaning up session on close');

        session.process.kill('SIGINT');
        setTimeout(() => {
          if (session.process) {
            session.process.kill('SIGKILL');
          }
        }, 1000);
        captureSessions.delete(sessionId);
      }
    });

    ws.on('error', error => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
};

module.exports = { setupWebSocketServer };
