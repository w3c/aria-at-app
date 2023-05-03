const AtLoader = require('./models/loaders/AtLoader');
const BrowserLoader = require('./models/loaders/BrowserLoader');

const getGraphQLContext = ({ req }) => {
    const user =
        req && req.session && req.session.user ? req.session.user : null;

    const atLoader = AtLoader();
    const browserLoader = BrowserLoader();

    return { user, atLoader, browserLoader };
};

module.exports = getGraphQLContext;
