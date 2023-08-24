const axios = require('axios');
const NodeCache = require('node-cache');

const {
    GITHUB_GRAPHQL_SERVER,
    GITHUB_OAUTH_SERVER,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GITHUB_TEAM_ADMIN,
    GITHUB_TEAM_ORGANIZATION,
    GITHUB_TEAM_QUERY
} = process.env;

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
const nodeCache = new NodeCache();

const getAllIssuesFromGitHub = async () => {
    let currentResults = [];
    let page = 1;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const issuesEndpoint =
            `https://api.github.com/repos/w3c/aria-at/issues` +
            `?labels=app&state=all&per_page=100`;
        const url = `${issuesEndpoint}&page=${page}`;
        const auth = {
            username: GITHUB_CLIENT_ID,
            password: GITHUB_CLIENT_SECRET
        };
        const response = await axios.get(url, { auth });

        // https://docs.github.com/en/rest/issues/issues#list-repository-issues
        // Filter out Pull Requests. GitHub's REST API v3 also considers every
        // pull request an issue.
        const issues = response.data.filter(data => !data.pull_request);

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

let activeIssuePromise;

const getAllIssues = async () => {
    const cacheResult = nodeCache.get('allIssues');

    if (cacheResult) return cacheResult;

    if (!activeIssuePromise) {
        // eslint-disable-next-line no-async-promise-executor
        activeIssuePromise = new Promise(async resolve => {
            const result = await getAllIssuesFromGitHub();

            nodeCache.set('allIssues', result, 60 /* 1 min */);

            activeIssuePromise = null;

            resolve();
        });
    }

    await activeIssuePromise;

    return nodeCache.get('allIssues');
};

module.exports = {
    graphQLEndpoint,
    getOauthUrl: ({ state = '' }) => {
        return (
            `${GITHUB_OAUTH_SERVER}/login/oauth/authorize?scope=` +
            `${permissionScopesURI}&client_id=${GITHUB_CLIENT_ID}` +
            `&state=${state}`
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
    async isMemberOfAdminTeam({ githubAccessToken, githubUsername }) {
        const query = `
            query {
                organization(login: "${GITHUB_TEAM_ORGANIZATION}") {
                    teams(
                        userLogins: "${githubUsername}",
                        query: "${GITHUB_TEAM_QUERY}",
                        first: 100
                    ) {
                        edges {
                            node {
                                name
                            }
                        }
                    }
                }
            }
        `;
        const response = await axios.post(
            this.graphQLEndpoint,
            { query },
            { headers: { Authorization: `bearer ${githubAccessToken}` } }
        );

        const isMember = !!response.data.data.organization.teams.edges
            .map(({ node: { name } }) => name)
            .find(teamName => teamName === GITHUB_TEAM_ADMIN);

        return isMember;
    },
    getAllIssues
};
