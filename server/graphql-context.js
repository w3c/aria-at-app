const getGraphQLContext = ({ req }) => {
    const user = req.session && req.session.user ? req.session.user : null;

    return { user };
};

module.exports = getGraphQLContext;
