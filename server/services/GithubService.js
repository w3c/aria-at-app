const axios = require('axios');
const staleWhileRevalidate = require('../util/staleWhileRevalidate');

const {
  ENVIRONMENT,
  GITHUB_GRAPHQL_SERVER,
  GITHUB_OAUTH_SERVER,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET
} = process.env;

const GITHUB_ISSUES_API_URL =
  ENVIRONMENT === 'production'
    ? 'https://api.github.com/repos/w3c/aria-at'
    : 'https://api.github.com/repos/bocoup/aria-at';

const permissionScopes = [
  // Not currently used, but this permissions scope will allow us to query for
  // the user's private email address via the REST API in the future (Note
  // that accessing private email addresses is not supported by GitHub's
  // GraphQL API)
  'user:email',

  // Allows checking whether the user is in the admin team
  'read:org'
];
const permissionScopesURI = encodeURI(permissionScopes.join(' '));
const graphQLEndpoint = `${GITHUB_GRAPHQL_SERVER}/graphql`;

const getAllIssues = async () => {
  let currentResults = [];
  let page = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const issuesEndpoint = `${GITHUB_ISSUES_API_URL}/issues?state=all&per_page=100`;
    const url = `${issuesEndpoint}&page=${page}`;
    const auth = {
      username: GITHUB_CLIENT_ID,
      password: GITHUB_CLIENT_SECRET
    };
    const response = await axios.get(url, { auth });

    const issues = response.data
      // https://docs.github.com/en/rest/issues/issues#list-repository-issues
      // Filter out Pull Requests. GitHub's REST API v3 also considers every
      // pull request an issue.
      .filter(data => !data.pull_request)
      // Our issue API should only return issues that were originally
      // created by the app, indicated by the presence of metadata
      // hidden in a comment
      .filter(data => data.body.includes('ARIA_AT_APP_ISSUE_DATA'));

    currentResults = [...currentResults, ...issues];

    const hasMoreResults = response.headers.link?.includes('rel="next"');

    if (hasMoreResults) {
      page += 1;
      continue;
    }

    break;
  }

  return currentResults;
};

module.exports = {
  graphQLEndpoint,
  getOauthUrl: () => {
    return (
      `${GITHUB_OAUTH_SERVER}/login/oauth/authorize?scope=` +
      `${permissionScopesURI}&client_id=${GITHUB_CLIENT_ID}`
    );
  },
  async getGithubAccessToken(code) {
    const redirectURL = `${GITHUB_OAUTH_SERVER}/login/oauth/access_token`;
    const response = await axios.post(
      redirectURL,
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code
      },
      { headers: { Accept: 'application/json' } }
    );
    return response && response.data && response.data.access_token;
  },
  async getGithubUsername(githubAccessToken) {
    const query = `
            query {
                viewer {
                    username: login
                }
            }
        `;
    const response = await axios.post(
      this.graphQLEndpoint,
      { query },
      { headers: { Authorization: `bearer ${githubAccessToken}` } }
    );
    return (
      response &&
      response.data &&
      response.data.data &&
      response.data.data.viewer.username
    );
  },

  getAllIssues: staleWhileRevalidate(getAllIssues, {
    millisecondsUntilStale: 10000 /* 10 seconds */
  })
};
