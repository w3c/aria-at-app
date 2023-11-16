const { sequelize } = require('./models');
const AtLoader = require('./models/loaders/AtLoader');
const BrowserLoader = require('./models/loaders/BrowserLoader');

let openTransactions = {};

const getGraphQLContext = async ({ req }) => {
    const transactionId = req.headers['x-transaction-id'];
    let transaction;
    if (transactionId) {
        if (!openTransactions[transactionId]) {
            console.log('created new');
            transaction = await sequelize.transaction();
            openTransactions[transactionId] = transaction;
        } else {
            console.log('found old');
            transaction = openTransactions[transactionId];
        }
    }
    console.log(transactionId, transaction);

    const user =
        req && req.session && req.session.user ? req.session.user : null;

    // AtLoader and BrowserLoader needed to fetch all At versions and browser versions, respectively
    const atLoader = AtLoader();
    const browserLoader = BrowserLoader();

    return { user, atLoader, browserLoader, transaction };
};

module.exports = getGraphQLContext;
