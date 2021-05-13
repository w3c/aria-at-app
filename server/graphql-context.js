const getGraphQLContext = ({ req }) => {
    return {
        user: req.session?.user ?? null
    };
};

module.exports = getGraphQLContext;
