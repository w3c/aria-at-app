const getGraphQLContext = ({ req }) => {
    const user = req.session?.user ?? null;
    return { user };
};

module.exports = getGraphQLContext;
