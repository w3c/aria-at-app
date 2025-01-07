const { WebApi, getBearerHandler } = require('azure-devops-node-api');
const { ClientSecretCredential } = require('@azure/identity');
const {
  promises: { resolve }
} = require('dns');

let azureClientId = null;
let azureClientSecret = null;
let azureTenantId = null;
let azureOrganization = null;
let azureProject = null;
let callbackUrlHostname = null;
let azureAppToken = null;

exports.setup = async () => {
  azureClientId = process.env.AZURE_CLIENT_ID;
  azureClientSecret = process.env.AZURE_CLIENT_SECRET;
  azureTenantId = process.env.AZURE_TENANT_ID;
  azureOrganization = process.env.AZURE_DEVOPS_ORGANIZATION;
  azureProject = process.env.AZURE_DEVOPS_PROJECT;
  azureAppToken = process.env.AZURE_APP_TOKEN;

  if (
    !azureClientId ||
    !azureClientSecret ||
    !azureTenantId ||
    !azureOrganization ||
    !azureProject ||
    !azureAppToken
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

const getAzureDevOpsConnection = async () => {
  const credential = new ClientSecretCredential(
    azureTenantId,
    azureClientId,
    azureClientSecret
  );

  const token = await credential.getToken(azureAppToken);
  const orgUrl = `https://dev.azure.com/${azureOrganization}`;
  return new WebApi(orgUrl, getBearerHandler(token.token));
};

const triggerAzurePipeline = async ({ job, directory, gitSha, atVersion }) => {
  const connection = await getAzureDevOpsConnection();
  const buildApi = await connection.getBuildApi();

  const atKey = job.testPlanRun.testPlanReport.at.key;
  const pipelineId = {
    nvda: 5
  }[atKey];

  if (!pipelineId) {
    throw new Error(`Unsupported AT pipeline for ${atKey}`);
  }

  const browser = job.testPlanRun.testPlanReport.browser.name.toLowerCase();
  const parameters = {
    callback_url: `https://${callbackUrlHostname}/api/jobs/${job.id}/test/:testRowNumber`,
    status_url: `https://${callbackUrlHostname}/api/jobs/${job.id}`,
    callback_header: `x-automation-secret:${job.secret}`,
    work_dir: `tests/${directory}`,
    aria_at_ref: gitSha,
    browser
  };

  if (atKey === 'nvda') {
    parameters.test_pattern = '{reference/**,test-*-nvda.*}';
    parameters.nvda_version = atVersion?.name;
  }

  // Mac unsupported for now
  // if (atKey === 'voiceover_macos') {
  //   parameters.macos_version = atVersion?.name?.split('.')[0];
  // }

  const definition = {
    definition: {
      id: pipelineId
    },
    sourceBranch: `refs/heads/main`,
    parameters: Object.fromEntries(
      Object.entries(parameters).map(([key, value]) => [key, value])
    )
  };

  try {
    await buildApi.queueBuild(definition, azureProject);
    return true;
  } catch (error) {
    throw new Error(error.message || 'Unable to initiate Azure pipeline');
  }
};

exports.default = triggerAzurePipeline;
