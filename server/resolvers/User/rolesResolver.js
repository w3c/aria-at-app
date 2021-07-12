const rolesResolver = user => {
    return user.roles.map(({ name }) => {
        return name;
    });
};

module.exports = rolesResolver;
