const { Assertion } = require('../../models');

const atBugsResolver = async ({ id }, _, context) => {
  const { transaction } = context;

  const assertion = await Assertion.findByPk(id, {
    include: [{ association: 'atBugs' }],
    transaction
  });

  return assertion?.atBugs || [];
};

module.exports = atBugsResolver;
