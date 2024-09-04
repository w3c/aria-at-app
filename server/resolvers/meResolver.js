const meResolver = (_, __, context) => {
  return context.user;
};

module.exports = meResolver;
