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

const constructIssuesQuery = async ({ ats, after, githubAccessToken }) => {
    let resultsByAt = { jaws: [], nvda: [], vo: [] };

    const query = `
        query {
            repository(owner: "howard-e", name: "aria-at-app") {
                id
                issues(
                  first: 100
                  ${after ? `after: "${after}"` : ''}
                  labels: ["app", "candidate-review"]
                  orderBy: {field: CREATED_AT, direction: DESC}
                ) {
                    totalCount
                    nodes {
                        body
                        author {
                            login
                        }
                        closed
                        title
                        labels(first: 10) {
                            totalCount
                            nodes {
                                name
                            }
                        }
                        state
                        number
                        bodyUrl
                    }
                    pageInfo {
                        hasNextPage
                        endCursor
                    }
                }
            }
        }
    `;

    const response = await axios.post(
        graphQLEndpoint,
        { query },
        { headers: { Authorization: `bearer ${githubAccessToken}` } }
    );
    const result = response?.data?.data;

    const { repository } = result;
    const { issues } = repository;
    const { totalCount, nodes, pageInfo } = issues;
    const { hasNextPage, endCursor } = pageInfo;

    if (totalCount) {
        resultsByAt = {
            jaws: ats.includes('jaws')
                ? [
                      ...resultsByAt.jaws,
                      ...nodes.filter(issue =>
                          issue.labels.nodes
                              .map(label => label.name)
                              .includes('jaws')
                      )
                  ]
                : [],
            nvda: ats.includes('nvda')
                ? [
                      ...resultsByAt.nvda,
                      ...nodes.filter(issue =>
                          issue.labels.nodes
                              .map(label => label.name)
                              .includes('nvda')
                      )
                  ]
                : [],
            vo: ats.includes('vo')
                ? [
                      ...resultsByAt.vo,
                      ...nodes.filter(issue =>
                          issue.labels.nodes
                              .map(label => label.name)
                              .includes('vo')
                      )
                  ]
                : []
        };
    }

    if (hasNextPage) {
        // call next page and build the resultsByAt again
        const additionalResultsByAt = await constructIssuesQuery({
            ats,
            after: endCursor,
            githubAccessToken
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
    async getCandidateReviewIssues({
        cacheId,
        ats = ['jaws', 'nvda', 'vo'],
        githubAccessToken
    }) {
        const cacheResult = nodeCache.get(cacheId);
        if (!cacheResult) {
            const result = await constructIssuesQuery({
                ats,
                githubAccessToken
            });
            nodeCache.set(cacheId, result, 300);
            return result;
        }
        return cacheResult;
    }
};
