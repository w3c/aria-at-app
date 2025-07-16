const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const UtteranceCapture = require('./capture-utterances');

const app = express();
const PORT = 3080;

app.use(cors()); // Allow access from React web app
app.use(bodyParser.json());

// Global variable to store ngrok URL
let ngrokUrl = null;
let ngrokProcess = null;

// Function to start ngrok tunnel
function startNgrokTunnel() {
  return new Promise((resolve, reject) => {
    console.info('Starting ngrok tunnel...');

    // Check if ngrok binary exists
    const ngrokBinary = process.platform === 'win32' ? 'ngrok.exe' : 'ngrok';

    // When built with pkg, binaries are in the same directory as the executable
    // process.execPath gives us the path to the current executable
    const executableDir = path.dirname(process.execPath);
    const ngrokPath = path.join(executableDir, ngrokBinary);

    console.info('Checking for ngrok at:', ngrokPath);

    if (!require('fs').existsSync(ngrokPath)) {
      console.warn('ngrok binary not found at:', ngrokPath);
      console.warn(
        'Available files in directory:',
        require('fs').readdirSync(executableDir)
      );
      resolve(null);
      return;
    }

    console.info('Found ngrok binary at:', ngrokPath);

    // Start ngrok tunnel
    ngrokProcess = exec(
      `${ngrokPath} http ${PORT} --log=stdout`,
      (error, stdout, stderr) => {
        if (stdout) console.info(stdout);
        if (stderr) {
          console.error('stderr:', stderr);
        }
        if (error) {
          console.error('ngrok error:', error);
          reject(error);
        }
      }
    );

    // Parse ngrok output to get the public URL
    ngrokProcess.stdout.on('data', data => {
      const output = data.toString();
      console.info('ngrok output:', output);

      // Look for the public URL in ngrok output
      const urlMatch = output.match(/https:\/\/[a-zA-Z0-9-]+\.ngrok-free\.app/);
      if (urlMatch && !ngrokUrl) {
        ngrokUrl = urlMatch[0];
        console.info('ngrok tunnel established:', ngrokUrl);
        resolve(ngrokUrl);
      }
    });

    ngrokProcess.stderr.on('data', data => {
      console.error('ngrok stderr:', data.toString());
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!ngrokUrl) {
        console.warn('ngrok tunnel not established within 10 seconds');
        resolve(null);
      }
    }, 10000);
  });
}

// Start ngrok tunnel when server starts
startNgrokTunnel()
  .then(url => {
    if (url) {
      console.info('✅ ngrok tunnel ready:', url);
      console.info(
        '📋 Copy this URL to your aria-at-app adb proxy configuration'
      );
    }
  })
  .catch(error => {
    console.error('❌ Failed to start ngrok tunnel:', error);
  });

app.get('/proxy-public-url', (req, res) => {
  if (ngrokUrl) {
    res.json({ url: ngrokUrl });
  } else {
    res.status(404).json({ error: 'ngrok tunnel not ready' });
  }
});

// Handle preflight requests for streaming endpoint
app.options('/stream-capture-utterances', cors());

// Whitelist of allowed commands and patterns
const SAFE_COMMANDS = [
  'devices',
  'logcat -c',
  'shell pm list packages',
  'shell settings get global development_settings_enabled',
  'shell settings get secure enabled_accessibility_services'
];

// Command patterns that require parameter validation
const SAFE_COMMAND_PATTERNS = [
  {
    pattern:
      /^shell pidof -s (com\.google\.android\.marvin\.talkback|com\.android\.chrome)$/,
    description: 'Get process ID for TalkBack or Chrome'
  },
  {
    pattern: /^logcat --pid=(\d+)( -v threadtime -d)?$/,
    description: 'Capture logs for specific process ID'
  },
  {
    pattern:
      /^shell settings put secure enabled_accessibility_services (com\.google\.android\.marvin\.talkback\/com\.google\.android\.marvin\.talkback\.TalkBackService|com\.google\.android\.marvin\.talkback\/NONE)$/,
    description: 'Enable/disable TalkBack accessibility service'
  },
  {
    pattern:
      /^shell settings put secure (accessibility_verbose_logging|accessibility_enabled) [01]$/,
    description: 'Set accessibility logging or enabled state'
  },
  {
    pattern:
      /^shell am start -n com\.android\.chrome\/com\.google\.android\.apps\.chrome\.Main -a android\.intent\.action\.VIEW -d "?(https?:\/\/[^\s"]+)"?$/,
    description: 'Open URL in Chrome'
  }
];

function isSafeCommand(cmd) {
  const trimmedCmd = cmd.trim();

  if (SAFE_COMMANDS.includes(trimmedCmd)) {
    return true;
  }

  for (const { pattern } of SAFE_COMMAND_PATTERNS) {
    if (pattern.test(trimmedCmd)) {
      return true;
    }
  }

  return false;
}

app.post('/run-adb', (req, res) => {
  const command = req.body.command;

  if (!command || !isSafeCommand(command)) {
    return res.status(400).json({ error: 'Invalid or unsafe command.' });
  }

  // Get the correct ADB path
  const executableDir = path.dirname(process.execPath);
  const adbBinary = process.platform === 'win32' ? 'adb.exe' : 'adb';
  const adbPath = path.join(executableDir, adbBinary);

  exec(`${adbPath} ${command}`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: stderr || error.message });
    }
    res.json({ output: stdout });
  });
});

// Stream capture utterances using Node.js implementation
app.post('/stream-capture-utterances', (req, res) => {
  // Set headers for Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // eslint-disable-next-line no-console
  console.info('Starting utterance capture');

  const capture = new UtteranceCapture();
  let captureEnded = false;

  // Handle utterance events
  capture.on('utterance', utteranceData => {
    res.write(
      `data: ${JSON.stringify({ type: 'utterance', data: utteranceData })}\n\n`
    );
  });

  capture.on('status', message => {
    res.write(`data: ${JSON.stringify({ type: 'status', data: message })}\n\n`);
  });

  capture.on('utterances_collected', allUtterances => {
    res.write(
      `data: ${JSON.stringify({
        type: 'utterances_collected',
        data: allUtterances
      })}\n\n`
    );
    captureEnded = true;
    res.end();
  });

  capture.on('error', error => {
    console.error('Capture error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error })}\n\n`);
    captureEnded = true;
    res.end();
  });

  capture.on('exit', code => {
    if (!captureEnded) {
      res.write(`data: ${JSON.stringify({ type: 'exit', code })}\n\n`);
      res.end();
    }
  });

  // Handle client disconnect
  req.on('close', () => {
    capture.stop();
  });

  // Start the capture
  capture
    .start()
    .then(() => {
      res.write(
        `data: ${JSON.stringify({
          type: 'started',
          message: 'Started capturing utterances'
        })}\n\n`
      );
    })
    .catch(error => {
      console.error('Failed to start capture:', error);
      res.write(
        `data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`
      );
      res.end();
    });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.info(`ADB proxy running on http://localhost:${PORT}`);
});

// Cleanup ngrok process on server shutdown
process.on('SIGINT', () => {
  console.info('Shutting down...');
  if (ngrokProcess) {
    ngrokProcess.kill();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.info('Shutting down...');
  if (ngrokProcess) {
    ngrokProcess.kill();
  }
  process.exit(0);
});
