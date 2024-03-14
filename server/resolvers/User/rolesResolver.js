const rolesResolver = (
    user,
    args, // eslint-disable-line no-unused-vars
    context // eslint-disable-line no-unused-vars
) => {
    return user.roles.map(({ name }) => {
        return name;
    });
};

module.exports = rolesResolver;
