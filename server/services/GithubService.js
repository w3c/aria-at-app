const axios = require('axios');
const { AuthorizationError } = require('../errors/auth');

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
    graphQLEndpoint: 'https://api.github.com/graphql',
    teamToRole: {
        [process.env.GITHUB_TEAM_TESTER]: 'tester',
        [process.env.GITHUB_TEAM_ADMIN]: 'admin'
    },
    getUrl: ({ state }) =>
        `https://github.com/login/oauth/authorize?scope=` +
        `${permissionScopesURI}&client_id=${process.env.GITHUB_CLIENT_ID}` +
        `&state=${state}`,
    async authorize(code) {
        const redirectURL = 'https://github.com/login/oauth/access_token';
        const response = await axios.post(
            redirectURL,
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code
            },
            {
                headers: { Accept: 'application/json' }
            }
        );
        return response.data.access_token;
    },
    async getUser(options) {
        if (typeof options === 'undefined' || !('accessToken' in options)) {
            throw new AuthorizationError('Not authorized.');
        }
        const query = '{ viewer { login name email } }';
        const response = await axios.post(
            this.graphQLEndpoint,
            {
                query
            },
            {
                headers: { Authorization: `bearer ${options.accessToken}` }
            }
        );

        const {
            data: {
                viewer: { login, name, email }
            }
        } = response.data;
        return { username: login, name, email };
    },
    async getUserTeams(options) {
        if (typeof options === 'undefined' || !('accessToken' in options)) {
            throw new AuthorizationError('Not authorized.');
        }
        const organization = process.env.GITHUB_TEAM_ORGANIZATION;
        const userLogin = options.userLogin;
        const teamQuery = process.env.GITHUB_TEAM_QUERY;
        const query = `{
                organization(login: "${organization}") {
                    teams(userLogins: "${userLogin}", query: "${teamQuery}", first: 100) {
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
            {
                query
            },
            {
                headers: { Authorization: `bearer ${options.accessToken}` }
            }
        );

        // The query may return more teams than "admin" or "tester". Therefore,
        //  we should filter out any teams that aren't in teamToRole
        const userTeams = response.data.data.organization.teams.edges
            .map(({ node: { name } }) => name)
            .filter(teamName => teamName in this.teamToRole);

        return userTeams;
    },
    async getIssues(options) {
        if (typeof options === 'undefined' || !('accessToken' in options)) {
            throw new AuthorizationError('Not authorized.');
        }

        const { accessToken, issues } = options;
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

        const owner = process.env.GITHUB_REPO_OWNER;
        const name = process.env.GITHUB_REPO_NAME;
        const query = `
        query FindIssues {
            repository(owner:"${owner}", name:"${name}") {
                ${queryIssues}
            }
        }
        `;

        const response = await axios.post(
            this.graphQLEndpoint,
            {
                query
            },
            {
                headers: { Authorization: `bearer ${accessToken}` }
            }
        );

        const result = unwrapGraphQLResponse(response);

        if (result.repository) {
            return Object.values(result.repository);
        }

        return [];
    },
    async createIssue(options) {
        if (typeof options === 'undefined' || !('accessToken' in options)) {
            throw new AuthorizationError('Not authorized.');
        }
        const repositoryId = process.env.GITHUB_REPO_ID;
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
            repositoryId,
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
                headers: { Authorization: `bearer ${options.accessToken}` }
            }
        );

        const result = unwrapGraphQLResponse(response);

        if (result.createIssue && result.createIssue.issue) {
            return result.createIssue.issue;
        }

        return null;
    }
};
