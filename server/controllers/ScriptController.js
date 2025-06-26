const axios = require('axios');

const TALKBACK_PACKAGE_NAME = 'com.google.android.marvin.talkback';
const PROXY_URL = process.env.ADB_PROXY_URL || 'http://localhost:3080';

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
      throw new Error(
        'Unable to connect to ADB proxy. Please ensure it is running on ' +
          PROXY_URL
      );
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

const checkTalkbackInstalled = async () => {
  const result = await runAdbCommand('shell pm list packages');
  return result.output.includes(TALKBACK_PACKAGE_NAME);
};

const checkTalkbackEnabled = async () => {
  const result = await runAdbCommand(
    'shell settings get secure enabled_accessibility_services'
  );
  return result.output.includes(TALKBACK_PACKAGE_NAME);
};

const checkChromeInstalled = async () => {
  const result = await runAdbCommand('shell pm list packages');
  return result.output.includes('com.android.chrome');
};

const checkDeviceStatus = async (req, res) => {
  try {
    const deviceConnected = await checkDeviceConnected();

    if (!deviceConnected) {
      return res.json({
        connected: false,
        message: 'No Android device connected'
      });
    }

    const developerMode = await checkDeveloperMode();
    const talkbackInstalled = await checkTalkbackInstalled();
    const talkbackEnabled = await checkTalkbackEnabled();
    const chromeInstalled = await checkChromeInstalled();

    res.json({
      connected: true,
      developerMode,
      talkbackInstalled,
      talkbackEnabled,
      chromeInstalled,
      message: 'Device status checked successfully'
    });
  } catch (error) {
    console.error(`Error checking device status: ${error.message}`);
    res.status(500).json({
      error: error.message
    });
  }
};

const executeEnableTalkback = async (req, res) => {
  try {
    if (!(await checkDeviceConnected())) {
      return res.status(400).json({
        error:
          'No Android device connected. Please connect a device with USB debugging enabled.'
      });
    }

    if (!(await checkDeveloperMode())) {
      return res.status(400).json({
        error: 'Developer mode is not enabled on the device.'
      });
    }

    if (!(await checkTalkbackInstalled())) {
      return res.status(400).json({
        error: 'TalkBack is not installed on the device.'
      });
    }

    if (await checkTalkbackEnabled()) {
      return res.json({
        success: true,
        output: 'TalkBack is already enabled.'
      });
    }

    await runAdbCommand(
      `shell settings put secure enabled_accessibility_services ${TALKBACK_PACKAGE_NAME}/${TALKBACK_PACKAGE_NAME}.TalkBackService`
    );
    await runAdbCommand(
      'shell settings put secure accessibility_verbose_logging 1'
    );
    await runAdbCommand('shell settings put secure accessibility_enabled 1');

    if (!(await checkTalkbackEnabled())) {
      return res.status(500).json({
        error: 'Failed to enable TalkBack.'
      });
    }

    res.json({
      success: true,
      output: 'TalkBack has been enabled successfully.'
    });
  } catch (error) {
    console.error(`Error enabling TalkBack: ${error.message}`);
    res.status(500).json({
      error: error.message
    });
  }
};

const executeOpenWebPage = async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    if (!(await checkDeviceConnected())) {
      return res.status(400).json({
        error:
          'No Android device connected. Please connect a device with USB debugging enabled.'
      });
    }

    if (!(await checkChromeInstalled())) {
      return res.status(400).json({
        error: 'Chrome is not installed on the device.'
      });
    }

    const command = `shell am start -n com.android.chrome/com.google.android.apps.chrome.Main -a android.intent.action.VIEW -d "${url}"`;
    console.log('Sending command to proxy:', JSON.stringify(command));

    await runAdbCommand(command);

    res.json({
      success: true,
      output: `URL opened successfully in Chrome: ${url}`
    });
  } catch (error) {
    console.error(`Error opening web page: ${error.message}`);
    res.status(500).json({
      error: error.message
    });
  }
};

module.exports = {
  executeEnableTalkback,
  executeOpenWebPage,
  checkDeviceStatus
};
