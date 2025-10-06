const atResolver = async ({ atId }, _, context) => {
  const { atLoader, transaction } = context;
  return await atLoader.getById({ id: atId, transaction });
};

module.exports = atResolver;
