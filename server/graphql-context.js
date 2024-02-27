const getGraphQLContext = ({ req }) => {
    const user =
        req && req.session && req.session.user ? req.session.user : null;

    let transaction;
    if (req) {
        transaction = req.transaction;
    } else {
        // Req will not be defined when queries are made with apolloServer.executeOperation()
        transaction = false;
    }

    return { user, transaction };
};

module.exports = getGraphQLContext;
