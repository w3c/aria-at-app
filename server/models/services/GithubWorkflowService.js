//import token from '../.github-app-token.json';
const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');

const ONE_MINUTE = 60;

// Assigned by GitHub
const GITHUB_APP_ID = '395709';

// > your JWT must be signed using the RS256 algorithm.
//
// https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-json-web-token-jwt-for-a-github-app
const ALGORITHM = 'RS256';

// > Note: [The `workflow_dispatch event] will only trigger a workflow run if
// > the workflow file is on the default branch.
//
// https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_dispatch
const WORKFLOW_FILE_NAME = 'nvda-chrome.yml';
const WORKFLOW_REPO = 'bocoup/aria-at-gh-actions-helper';

// Generated from the GitHub.com UI
let privateKey = null;
try {
    privateKey = fs.readFileSync(
        path.join(
            __dirname,
            '../../../config',
            'aria-at-collection-scheduler.2023-09-27.private-key.pem'
        )
    );
} catch (e) {
    // Empty catch block, if the key is null we will hear about it later.
}

// > 2. Get the ID of the installation that you want to authenticate as.
// >
// >   If you are responding to a webhook event, the webhook payload will
// >   include the installation ID.
// >
// >   You can also use the REST API to find the ID for an installation of your
// >   app. For example, you can get an installation ID with the `GET
// >   /users/{username}/installation`, `GET
// >   /repos/{owner}/{repo}/installation`, `GET /orgs/{org}/installation`, or
// >   `GET /app/installations endpoints`. For more information, see
// >   "[GitHub Apps](https://docs.github.com/en/rest/apps/apps)".
//
// https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation
const GITHUB_APP_INSTALLATION_ID = '42217598';

// > The time that the JWT was created. To protect against clock drift, we
// > recommend that you set this 60 seconds in the past and ensure that your
// > server's date and time is set accurately (for example, by using the Network
// > Time Protocol).
//
// https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-json-web-token-jwt-for-a-github-app
const calculateIssuedAt = () => Math.round(Date.now() / 1000) - ONE_MINUTE;

const createJWT = (payload, privateKey, algorithm) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, privateKey, { algorithm }, (err, token) => {
            token ? resolve(token) : reject(err);
        });
    });
};

// > The expiration time of the JWT, after which it can't be used to request an
// > installation token. The time must be no more than 10 minutes into the
// > future.
//
// https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-json-web-token-jwt-for-a-github-app
const calculateExpiresAt = () => Math.round(Date.now() / 1000) + 9 * ONE_MINUTE;

const fetchInstallationAccessToken = async (jsonWebToken, installationID) => {
    const response = await fetch(
        `https://api.github.com/app/installations/${installationID}/access_tokens`,
        {
            method: 'POST',
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${jsonWebToken}`,
                'X-GitHub-Api-Version': '2022-11-28'
            }
        }
    );

    if (!response.ok) {
        const message = await (() => {
            try {
                return response.text();
            } catch (_) {
                return 'Unable to retrieve installation access token';
            }
        })();

        throw new Error(message);
    }

    return (await response.json()).token;
};

const createGithubWorkflow = async ({
    job,
    directory = 'alert',
    gitSha = 'master'
}) => {
    const payload = {
        iat: calculateIssuedAt(),
        exp: calculateExpiresAt(),
        iss: GITHUB_APP_ID
    };
    const jsonWebToken = await createJWT(payload, privateKey, ALGORITHM);
    const accessToken = await fetchInstallationAccessToken(
        jsonWebToken,
        GITHUB_APP_INSTALLATION_ID
    );
    const inputs = {
        nonce: job.id,
        callback_url: `https://${process.env.AUTOMATION_CALLBACK_FQDN}/api/jobs/${job.id}/result`,
        status_url: `https://${process.env.AUTOMATION_CALLBACK_FQDN}/api/jobs/${job.id}/update`,
        // TODO: This should probably just be configured instead of us passing it to the scheduler every time
        callback_header: `x-automation-secret:${process.env.AUTOMATION_SCHEDULER_SECRET}`,
        work_dir: `tests/${directory}`,
        test_pattern: 'reference/**,test-*-nvda.*',
        aria_at_ref: gitSha
    };
    const response = await fetch(
        `https://api.github.com/repos/${WORKFLOW_REPO}/actions/workflows/${WORKFLOW_FILE_NAME}/dispatches`,
        {
            method: 'POST',
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${accessToken}`,
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify({
                ref: 'main',
                inputs
            })
        }
    );

    if (!response.ok) {
        const message = await (() => {
            try {
                return response.text();
            } catch (_) {
                return 'Unable to initiate workflow';
            }
        })();

        throw new Error(message);
    }

    // TODO: Listen for GitHub Webhook event describing the new workflow, and
    // return its ID.
    return true;
};

exports.default = createGithubWorkflow;
