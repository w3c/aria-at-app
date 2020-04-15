const axios = require('axios');
const { AuthorizationError } = require('../errors/auth');

const permissionScopes = ['user:email', 'read:org', 'read:discussion'];
const permissionScopesURI = encodeURI(
    permissionScopes.reduce((a, b) => `${a} ${b}`)
);

module.exports = {
    url: `https://github.com/login/oauth/authorize?scope=${permissionScopesURI}&client_id=${process.env.GITHUB_CLIENT_ID}`,
    graphQLEndpoint: 'https://api.github.com/graphql',
    teamToRole: {
        [process.env.GITHUB_TEAM_TESTER]: 'tester',
        [process.env.GITHUB_TEAM_ADMIN]: 'admin'
    },
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
        const organization = process.env.GITHUB_ORGANIZATION;
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
        const userTeams = response.data.data.organization.teams.edges.map(
            ({ node: { name } }) => name
        );

        return userTeams;
    }
};
