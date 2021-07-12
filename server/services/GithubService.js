const axios = require('axios');
const { User } = require('../models');
const { AuthorizationError } = require('../errors/auth');

const {
    GITHUB_GRAPHQL_SERVER,
    GITHUB_OAUTH_SERVER,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GITHUB_TEAM_TESTER,
    GITHUB_TEAM_ADMIN,
    GITHUB_TEAM_ORGANIZATION,
    GITHUB_TEAM_QUERY,
    GITHUB_REPO_OWNER,
    GITHUB_REPO_NAME,
    GITHUB_REPO_ID
} = process.env;

const permissionScopes = [
    'user:email',
    'read:org',
    'read:discussion',
    'public_repo'
];
const permissionScopesURI = encodeURI(
    permissionScopes.reduce((a, b) => `${a} ${b}`)
);

function unwrapGraphQLResponse(response) {
    if (response.data && response.data.data) {
        return response.data.data;
    }

    if (response.data && response.data.errors) {
        return response.data.errors;
    }
}

module.exports = {
    graphQLEndpoint: `${GITHUB_GRAPHQL_SERVER}/graphql`,
    teamToRole: {
        [GITHUB_TEAM_TESTER]: User.TESTER,
        [GITHUB_TEAM_ADMIN]: User.ADMIN
    },
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
        const query = '{ viewer { username: login } }';
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
    async getGithubTeams({ githubAccessToken, githubUsername }) {
        const query = `
            {
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

        const userTeams = response.data.data.organization.teams.edges
            .map(({ node: { name } }) => name)
            // The query may return more teams than "admin" or "tester". Therefore,
            //  we should filter out any teams that aren't in teamToRole
            .filter(teamName => teamName in this.teamToRole);

        return userTeams.map(teamName => this.teamToRole[teamName]);
    },
    async getIssues(options) {
        if (
            typeof options === 'undefined' ||
            !('githubAccessToken' in options)
        ) {
            throw new AuthorizationError('Not authorized.');
        }

        const { githubAccessToken, issues } = options;
        const issueNumbers = issues.map(({ issue_number }) => issue_number);

        let queryIssues = '';

        for (let number of issueNumbers) {
            queryIssues = `${queryIssues}
                _${number}: issue(number: ${number}) {
                    closed,
                    closedAt,
                    publishedAt,
                    updatedAt,
                    number,
                    author {
                      avatarUrl,
                      login
                    },
                    state,
                    title,
                    body,
                    bodyHTML
                }
            `.trim();
        }

        const query = `
        query FindIssues {
            repository(owner:"${GITHUB_REPO_OWNER}", name:"${GITHUB_REPO_NAME}") {
                ${queryIssues}
            }
        }
        `;

        const response = await axios.post(
            this.graphQLEndpoint,
            { query },
            { headers: { Authorization: `bearer ${githubAccessToken}` } }
        );

        const result = unwrapGraphQLResponse(response);

        if (result.repository) {
            return Object.values(result.repository);
        }

        return [];
    },
    async createIssue(options) {
        if (
            typeof options === 'undefined' ||
            !('githubAccessToken' in options)
        ) {
            throw new AuthorizationError('Not authorized.');
        }
        const { title, body } = options.issue;

        const query = `
        mutation createIssue ($title:String, $body:String, $repositoryId:String) {
          createIssue(
            input: {
              repositoryId: $repositoryId,
              title: $title,
              body: $body
            }
          ) {
            issue {
                closed,
                closedAt,
                publishedAt,
                updatedAt,
                number,
                author {
                  avatarUrl,
                  login
                },
                state,
                title,
                body,
                bodyHTML
            }
          }
        }
        `;

        const variables = {
            repositoryId: GITHUB_REPO_ID,
            title,
            body
        };

        const response = await axios.post(
            this.graphQLEndpoint,
            {
                query,
                variables
            },
            {
                headers: {
                    Authorization: `bearer ${options.githubAccessToken}`
                }
            }
        );

        const result = unwrapGraphQLResponse(response);

        if (result.createIssue && result.createIssue.issue) {
            return result.createIssue.issue;
        }

        return null;
    }
};
