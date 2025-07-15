const axios = require('axios');

const TALKBACK_PACKAGE_NAME = 'com.google.android.marvin.talkback';
const PROXY_URL = process.env.ADB_PROXY_URL || 'http://localhost:3080';

const getCurrentProxyUrl = req => {
  // Get proxy URL from user session, fallback to default
  return req.session?.proxyUrl || PROXY_URL;
};

const updateProxyUrl = (req, url) => {
  // Store proxy URL in user session
  if (!req.session) req.session = {};
  req.session.proxyUrl = url;
};

const runAdbCommand = async (command, req) => {
  const proxyUrl = getCurrentProxyUrl(req);
  try {
    const response = await axios.post(`${proxyUrl}/run-adb`, {
      command: command
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`ADB command failed: ${error.response.data.error}`);
    } else if (error.request) {
      throw new Error(
        'Unable to connect to ADB proxy. Please ensure it is running on ' +
          proxyUrl
      );
    } else {
      throw new Error(`Request failed: ${error.message}`);
    }
  }
};

const checkDeviceConnected = async req => {
  const result = await runAdbCommand('devices', req);
  const lines = result.output
    .split('\n')
    .filter(line => line.trim() && !line.includes('List of devices'));
  return lines.length > 0 && lines.some(line => line.includes('device'));
};

const checkDeveloperMode = async req => {
  const result = await runAdbCommand(
    'shell settings get global development_settings_enabled',
    req
  );
  return result.output.trim() === '1';
};

const checkTalkbackInstalled = async req => {
  const result = await runAdbCommand('shell pm list packages', req);
  return result.output.includes(TALKBACK_PACKAGE_NAME);
};

const checkTalkbackEnabled = async req => {
  const result = await runAdbCommand(
    'shell settings get secure enabled_accessibility_services',
    req
  );
  return result.output.includes(TALKBACK_PACKAGE_NAME);
};

const checkChromeInstalled = async req => {
  const result = await runAdbCommand('shell pm list packages', req);
  return result.output.includes('com.android.chrome');
};

const checkDeviceStatus = async (req, res) => {
  try {
    const deviceConnected = await checkDeviceConnected(req);

    if (!deviceConnected) {
      return res.json({
        connected: false,
        message: 'No Android device connected'
      });
    }

    const developerMode = await checkDeveloperMode(req);
    const talkbackInstalled = await checkTalkbackInstalled(req);
    const talkbackEnabled = await checkTalkbackEnabled(req);
    const chromeInstalled = await checkChromeInstalled(req);

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
    if (!(await checkDeviceConnected(req))) {
      return res.status(400).json({
        error:
          'No Android device connected. Please connect a device with USB debugging enabled.'
      });
    }

    if (!(await checkDeveloperMode(req))) {
      return res.status(400).json({
        error: 'Developer mode is not enabled on the device.'
      });
    }

    if (!(await checkTalkbackInstalled(req))) {
      return res.status(400).json({
        error: 'TalkBack is not installed on the device.'
      });
    }

    if (await checkTalkbackEnabled(req)) {
      return res.json({
        success: true,
        output: 'TalkBack is already enabled.'
      });
    }

    await runAdbCommand(
      `shell settings put secure enabled_accessibility_services ${TALKBACK_PACKAGE_NAME}/${TALKBACK_PACKAGE_NAME}.TalkBackService`,
      req
    );
    await runAdbCommand(
      'shell settings put secure accessibility_verbose_logging 1',
      req
    );
    await runAdbCommand(
      'shell settings put secure accessibility_enabled 1',
      req
    );

    if (!(await checkTalkbackEnabled(req))) {
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
    if (!(await checkDeviceConnected(req))) {
      return res.status(400).json({
        error:
          'No Android device connected. Please connect a device with USB debugging enabled.'
      });
    }

    if (!(await checkChromeInstalled(req))) {
      return res.status(400).json({
        error: 'Chrome is not installed on the device.'
      });
    }

    const command = `shell am start -n com.android.chrome/com.google.android.apps.chrome.Main -a android.intent.action.VIEW -d "${url}"`;

    await runAdbCommand(command, req);

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

const setProxyUrl = async (req, res) => {
  const { proxyUrl } = req.body;

  if (!proxyUrl) {
    return res.status(400).json({ error: 'Proxy URL is required' });
  }

  try {
    // Basic URL validation
    new URL(proxyUrl);

    updateProxyUrl(req, proxyUrl);

    res.json({
      success: true,
      message: `Proxy URL updated to: ${proxyUrl}`,
      proxyUrl: proxyUrl
    });
  } catch (error) {
    console.error(`Error setting proxy URL: ${error.message}`);
    res.status(400).json({
      error: 'Invalid URL format'
    });
  }
};

const getProxyUrl = async (req, res) => {
  try {
    res.json({
      success: true,
      proxyUrl: getCurrentProxyUrl(req)
    });
  } catch (error) {
    console.error(`Error getting proxy URL: ${error.message}`);
    res.status(500).json({
      error: error.message
    });
  }
};

module.exports = {
  executeEnableTalkback,
  executeOpenWebPage,
  checkDeviceStatus,
  setProxyUrl,
  getProxyUrl
};
