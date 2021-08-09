const updateMeResolver = (_, __, context) => {
    return context.user;
};

module.exports = updateMeResolver;
