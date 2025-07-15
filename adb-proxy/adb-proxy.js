const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const cors = require('cors');
const UtteranceCapture = require('./capture-utterances');

const app = express();
const PORT = 3080;

app.use(cors()); // Allow access from React web app
app.use(bodyParser.json());

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

  exec(`adb ${command}`, (error, stdout, stderr) => {
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
