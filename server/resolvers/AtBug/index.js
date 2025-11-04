const assertionsResolver = require('./assertionsResolver');

const atResolver = async (parent, _, context) => {
  const { transaction } = context;

  // If the parent already has at loaded, return it directly
  if (parent?.at) return parent.at;

  // If atId is null or undefined, return null
  if (!parent?.atId) {
    return null;
  }

  const { At } = require('../../models');
  return await At.findByPk(parent.atId, {
    attributes: ['id', 'name'],
    transaction
  });
};

const AtBug = {
  assertions: assertionsResolver,
  at: atResolver
};

module.exports = AtBug;
