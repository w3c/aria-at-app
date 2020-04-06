const authorize = require('../../tests/util/create');

const GithubService = {
    url: 'localhost:5000/login',
    authorize
};

module.exports = GithubService;
