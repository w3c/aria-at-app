const { exec } = require('child_process');
const path = require('path');

const executeOpenWebPage = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const scriptPath = path.join(
    __dirname,
    '../scripts/talkback-capture/openWebPage.sh'
  );

  exec(`sh ${scriptPath} "${url}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error}`);
      return res.status(500).json({ error: 'Failed to execute script' });
    }

    if (stderr) {
      console.error(`Script stderr: ${stderr}`);
    }

    res.json({ success: true, output: stdout });
  });
};

module.exports = {
  executeOpenWebPage
};
