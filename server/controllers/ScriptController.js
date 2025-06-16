// const os = require('os');
const { exec } = require('child_process');
const path = require('path');

// const platform = os.platform();

const getPlatformSpecificCommand = script => {
  let scriptPath;
  let command = null;

  // TODO: Complete buildout of this when platform-agnostic need exists.
  //  Matters less right now since deployed on linux environment
  //  WIP branch exists on aria-at-talkback-capture
  /*switch (platform) {
    case 'darwin': // macOS
      scriptPath = path.join(
        __dirname,
        `../scripts/talkback-capture/${script}.sh`
      );
      command = `sh ${scriptPath}`;
      break;
    case 'linux':
      scriptPath = path.join(
        __dirname,
        `../scripts/talkback-capture/linux/${script}.sh`
      );
      command = `sh ${scriptPath}`;
      break;
    case 'win32':
      scriptPath = path.join(
        __dirname,
        `../scripts/talkback-capture/win32/${script}.ps1`
      );
      command = scriptPath;
      break;
    default:
      break;
  }*/

  scriptPath = path.join(__dirname, `../scripts/talkback-capture/${script}.sh`);
  command = `sh ${scriptPath}`;
  return command;
};

const executeEnableTalkback = async (req, res) => {
  const command = getPlatformSpecificCommand('enableTalkback');
  if (!command) return res.status(400).json({ error: 'Unsupported platform' });

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error}`);
      return res.status(500).json({ error: 'Failed to execute script' });
    }
    if (stderr) console.error(`Script stderr: ${stderr}`);

    res.json({ success: true, output: stdout });
  });
};

const executeOpenWebPage = async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const command = getPlatformSpecificCommand('openWebPage');
  if (!command) return res.status(400).json({ error: 'Unsupported platform' });

  exec(`${command} "${url}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error}`);
      return res.status(500).json({ error: 'Failed to execute script' });
    }
    if (stderr) console.error(`Script stderr: ${stderr}`);

    res.json({ success: true, output: stdout });
  });
};

module.exports = {
  executeEnableTalkback,
  executeOpenWebPage
};
