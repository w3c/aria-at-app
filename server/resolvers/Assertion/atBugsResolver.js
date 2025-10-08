const { Assertion } = require('../../models');
const {
  getAssertionByEncodedId
} = require('../../models/services/AssertionService');

const atBugsResolver = async (parent, _, context) => {
  const { transaction } = context;

  // If the parent already has atBugs loaded, return it directly
  if (parent?.atBugs) return parent.atBugs;

  const { id } = parent;

  // GraphQL Assertion.id is an encoded ID; fall back to numeric if provided
  let numericId = null;

  // Try encoded lookup first
  const byEncoded = await getAssertionByEncodedId({
    encodedId: id,
    transaction
  }).catch(() => null);

  if (byEncoded) numericId = byEncoded.id;
  else if (/^\d+$/.test(String(id))) numericId = Number(id);

  if (!numericId) return [];

  const assertion = await Assertion.findByPk(numericId, {
    include: [
      {
        association: 'atBugs',
        include: [{ association: 'at' }]
      }
    ],
    transaction
  });

  return assertion?.atBugs || [];
};

module.exports = atBugsResolver;
