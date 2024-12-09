const axios = require('axios');
const {
  promises: { resolve }
} = require('dns');
const qs = require('querystring');

let azureClientId = null;
let azureClientSecret = null;
let azureTenantId = null;
let azureOrganization = null;
let azureProject = null;
let callbackUrlHostname = null;

exports.setup = async () => {
  azureClientId = process.env.AZURE_CLIENT_ID;
  azureClientSecret = process.env.AZURE_CLIENT_SECRET;
  azureTenantId = process.env.AZURE_TENANT_ID;
  azureOrganization = process.env.AZURE_DEVOPS_ORGANIZATION;
  azureProject = process.env.AZURE_DEVOPS_PROJECT;

  if (
    !azureClientId ||
    !azureClientSecret ||
    !azureTenantId ||
    !azureOrganization ||
    !azureProject
  ) {
    throw new Error(
      'Azure DevOps configuration is incomplete. Please check your environment variables.'
    );
  }

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

exports.isEnabled = () =>
  azureClientId &&
  azureClientSecret &&
  azureTenantId &&
  azureOrganization &&
  azureProject &&
  callbackUrlHostname;

const getAccessToken = async () => {
  const tokenEndpoint = `https://login.microsoftonline.com/${azureTenantId}/oauth2/v2.0/token`;
  const data = {
    client_id: azureClientId,
    client_secret: azureClientSecret,
    scope: 'https://management.azure.com/.default',
    grant_type: 'client_credentials'
  };

  const response = await axios.post(tokenEndpoint, qs.stringify(data), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      response.data ?? 'Unable to retrieve installation access token'
    );
  }
  return response.data.access_token;
};

const triggerAzurePipeline = async ({ job, directory, gitSha, atVersion }) => {
  const accessToken = await getAccessToken();

  const atKey = job.testPlanRun.testPlanReport.at.key;
  const pipelineName = {
    nvda: 'nvda-test',
    voiceover_macos: 'voiceover-test'
  }[atKey];

  if (!pipelineName) {
    throw new Error(`Unsupported AT pipeline for ${atKey}`);
  }

  const browser = job.testPlanRun.testPlanReport.browser.name.toLowerCase();
  const variables = {
    callback_url: `https://${callbackUrlHostname}/api/jobs/${job.id}/test/:testRowNumber`,
    status_url: `https://${callbackUrlHostname}/api/jobs/${job.id}`,
    callback_header: `x-automation-secret:${job.secret}`,
    work_dir: `tests/${directory}`,
    aria_at_ref: gitSha,
    browser: browser
  };

  if (atKey === 'nvda') {
    variables.test_pattern = '{reference/**,test-*-nvda.*}';
    variables.nvda_version = atVersion?.name;
  }
  if (atKey === 'voiceover_macos') {
    variables.macos_version = atVersion?.name?.split('.')[0];
  }

  const axiosConfig = {
    method: 'POST',
    url: `https://dev.azure.com/${azureOrganization}/${azureProject}/_apis/pipelines/${pipelineName}/runs?api-version=6.0-preview.1`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    data: JSON.stringify({
      resources: {
        repositories: {
          self: {
            refName: 'refs/heads/main'
          }
        }
      },
      variables: Object.fromEntries(
        Object.entries(variables).map(([key, value]) => [key, { value }])
      )
    }),
    validateStatus: () => true,
    responseType: 'json'
  };

  const response = await axios(axiosConfig);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      response.data
        ? JSON.stringify(response.data)
        : 'Unable to initiate Azure pipeline'
    );
  }
  return true;
};

exports.default = triggerAzurePipeline;
