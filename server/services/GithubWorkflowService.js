const { Octokit } = require('@octokit/rest');
const { createAppAuth } = require('@octokit/auth-app');
const {
  promises: { resolve }
} = require('dns');

// > Note: [The `workflow_dispatch event] will only trigger a workflow run if
// > the workflow file is on the default branch.
//
// https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_dispatch
const WORKFLOW_REPO = process.env.GITHUB_WORKFLOW_REPO;

let octokit = null;
let callbackUrlHostname = null;

exports.setup = async () => {
  const appId = process.env.GITHUB_APP_ID;
  if (!appId) {
    throw new Error(
      'Environment GITHUB_APP_ID must be set to the GitHub App ID.'
    );
  }

  // The installation ID can be found via the GitHub API once the app is
  // installed on an org: GET /orgs/{org}/installation
  // https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;
  if (!installationId) {
    throw new Error(
      'Environment GITHUB_APP_INSTALLATION_ID must be set to the ' +
        'GitHub App installation ID.'
    );
  }

  // Provide the PEM key generated from the Github app. The value must be base64-encoded.
  const rawKey = process.env.GITHUB_APP_PRIVATE_KEY;
  if (!rawKey) {
    throw new Error(
      'Environment GITHUB_APP_PRIVATE_KEY must be set to the GitHub App PEM ' +
        'private key (base64-encoded).'
    );
  }

  // Decode the base64-encoded PEM key.
  const privateKey = Buffer.from(rawKey, 'base64').toString('utf8');

  if (!privateKey.includes('-----BEGIN')) {
    throw new Error(
      'GITHUB_APP_PRIVATE_KEY does not appear to be a valid base64-encoded ' +
        'PEM key.'
    );
  }

  // Octokit handles JWT creation, signing, and installation token
  // exchange automatically via @octokit/auth-app.
  octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey,
      installationId
    }
  });

  // strip possible https:// at start and trailing /
  callbackUrlHostname = process.env.AUTOMATION_CALLBACK_FQDN?.replace(
    /(^[^:]+:\/\/|\/$)/g,
    ''
  );
  if (!callbackUrlHostname) {
    throw new Error(
      'Environment AUTOMATION_CALLBACK_FQDN must be set to a valid hostname for the public address.'
    );
  }
  try {
    const results = await resolve(callbackUrlHostname);
    if (results.length < 1) {
      throw new Error('no results');
    }
  } catch (error) {
    throw new Error(
      `Error while resolving AUTOMATION_CALLBACK_FQDN ${callbackUrlHostname} ${error}`
    );
  }
};

exports.isEnabled = () => octokit && callbackUrlHostname;

/**
 * We just want the whole number of the macOS version
 * due to limitations on Github workflow runners
 * See https://github.com/w3c/aria-at-app/issues/1143 for more info
 *
 * @param {object} atVersion
 * @param {string} atVersion.name
 */
const getMacOSVersionName = atVersion => {
  return atVersion?.name?.split('.')[0];
};

/**
 * @param {string} atKey
 * @param {object} atVersion
 * @param {string} atVersion.name
 */
const getWorkflowNameForMacOS = (atKey, atVersion) => {
  const atVersionName = getMacOSVersionName(atVersion);
  if (atVersionName === '15') return 'self-hosted-macos-15.yml';
  else return 'voiceover-test.yml';
};

const createGithubWorkflow = async ({ job, directory, gitSha, atVersion }) => {
  const [owner, repo] = WORKFLOW_REPO.split('/');

  const atKey = job.testPlanRun.testPlanReport.at.key;
  const workflowFilename = {
    nvda: 'nvda-test.yml',
    voiceover_macos: getWorkflowNameForMacOS(atKey, atVersion),
    jaws: 'jaws-test.yml'
  }[atKey];

  if (!workflowFilename) {
    throw new Error(`Unsupported AT workflow for ${atKey}`);
  }

  let browser = job.testPlanRun.testPlanReport.browser.key;
  // not sure why this "key" doesn't match, but the rest do.
  if (browser == 'safari_macos') browser = 'safari';
  const inputs = {
    callback_url: `https://${callbackUrlHostname}/api/jobs/${job.id}/test/:testRowNumber`,
    status_url: `https://${callbackUrlHostname}/api/jobs/${job.id}`,
    callback_header: `x-automation-secret:${job.secret}`,
    work_dir: `tests/${directory}`,
    aria_at_ref: gitSha
  };
  if (atKey === 'nvda') {
    inputs.test_pattern = '{reference/**,test-*-nvda.*}';
    inputs.browser = browser;
    inputs.nvda_version = atVersion?.name;
  }
  if (atKey === 'voiceover_macos') {
    inputs.macos_version = getMacOSVersionName(atVersion);
    inputs.browser = browser;
  }
  if (atKey === 'jaws') {
    inputs.browser = browser;
    inputs.jaws_version = atVersion?.name ?? 'latest';
  }

  await octokit.actions.createWorkflowDispatch({
    owner,
    repo,
    workflow_id: workflowFilename,
    ref: 'main',
    inputs
  });

  return true;
};

exports.default = createGithubWorkflow;
