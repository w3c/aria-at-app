const getGraphQLContext = ({ req }) => {
    const user =
        req && req.session && req.session.user ? req.session.user : null;

    return { user, transaction: req.transaction };
};

module.exports = getGraphQLContext;
