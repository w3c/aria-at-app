const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = 3080;

app.use(cors()); // Allow access from React web app
app.use(bodyParser.json());

// Whitelist of allowed commands
const SAFE_COMMANDS = ['devices'];

function isSafeCommand(cmd) {
  return SAFE_COMMANDS.includes(cmd.trim());
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

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.info(`ADB proxy running on http://localhost:${PORT}`);
});
