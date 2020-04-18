const authorize = require('../../tests/util/create');

const GithubService = {
    url: 'localhost:5000/login',
    authorize,
    getUser() {
        return { username: 'foobar', name: 'Foo Bar', email: 'foo@bar.com' };
    }
};

module.exports = GithubService;
