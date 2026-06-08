const rolesResolver = (
  user,
  args, // eslint-disable-line no-unused-vars
  context
) => {
  if (!context.user) {
    return [];
  }
  return user.roles.map(({ name }) => {
    return name;
  });
};

module.exports = rolesResolver;
