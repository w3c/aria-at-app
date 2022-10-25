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
const CACHE_MINUTES = 2;

const constructIssuesRequest = async ({
    ats = ['jaws', 'nvda', 'vo'],
    page = 1
}) => {
    const issuesEndpoint = `https://api.github.com/repos/w3c/aria-at-app/issues?labels=app,candidate-review&per_page=100`;
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
    const headersLink = response.headers.link;

    let resultsByAt = { jaws: [], nvda: [], vo: [] };
    if (issues.length) {
        resultsByAt = {
            jaws: ats.includes('jaws')
                ? [
                      ...issues.filter(issue =>
                          issue.labels.map(label => label.name).includes('jaws')
                      )
                  ]
                : [],
            nvda: ats.includes('nvda')
                ? [
                      ...issues.filter(issue =>
                          issue.labels.map(label => label.name).includes('nvda')
                      )
                  ]
                : [],
            vo: ats.includes('vo')
                ? [
                      ...issues.filter(issue =>
                          issue.labels.map(label => label.name).includes('vo')
                      )
                  ]
                : []
        };
    }

    // Check if additional pages exist
    if (headersLink && headersLink.includes('rel="next"')) {
        // Get result from other pages
        const additionalResultsByAt = await constructIssuesRequest({
            ats,
            page: page + 1
        });
        resultsByAt = {
            jaws: ats.includes('jaws')
                ? [...resultsByAt.jaws, ...additionalResultsByAt.jaws]
                : [],
            nvda: ats.includes('nvda')
                ? [...resultsByAt.nvda, ...additionalResultsByAt.nvda]
                : [],
            vo: ats.includes('vo')
                ? [...resultsByAt.vo, ...additionalResultsByAt.vo]
                : []
        };
    }

    return resultsByAt;
};

const createFeedbackIssue = async ({ title, labels, body }) => {
    const issuesEndpoint = `https://api.github.com/repos/evmiguel/aria-at-app/issues`;
    const requestBody = {
        title,
        body,
        labels
    };

    const auth = {
        // TODO: add real auth credentials
        username: '',
        password: ''
    };

    const response = await axios.post(
        issuesEndpoint,
        { ...requestBody },
        { auth }
    );

    return response;
};

module.exports = {
    createFeedbackIssue,
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
    async getCandidateReviewIssuesByAt({ cacheId, atName }) {
        const cacheResult = nodeCache.get(cacheId);

        let atKey = '';
        switch (atName) {
            case 'JAWS':
                atKey = 'jaws';
                break;
            case 'NVDA':
                atKey = 'nvda';
                break;
            case 'VoiceOver for macOS':
                atKey = 'vo';
                break;
        }

        if (!cacheResult) {
            const result = await constructIssuesRequest({
                ats: [atKey]
            });
            nodeCache.set(cacheId, result, CACHE_MINUTES * 60);
            return result[atKey];
        }
        return cacheResult[atKey];
    }
};
