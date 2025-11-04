const {
  getAssertionByEncodedId
} = require('../../models/services/AssertionService');

const atBugsResolver = async (parent, args, context) => {
  const { transaction } = context;
  const { commandId } = args;

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

  // Always filter by commandId if provided, otherwise get all bugs with their commandIds
  const AssertionAtBug = require('../../models').AssertionAtBug;

  const whereClause = { assertionId: numericId };
  if (commandId) {
    whereClause.commandId = commandId;
  }

  const links = await AssertionAtBug.findAll({
    where: whereClause,
    attributes: ['atBugId', 'commandId'],
    transaction
  });

  if (links.length === 0) return [];

  const bugIds = [...new Set(links.map(l => l.atBugId))];
  const { AtBug } = require('../../models');

  const bugs = await AtBug.findAll({
    where: { id: bugIds },
    include: [{ association: 'at' }],
    transaction
  });

  // Attach commandId to each bug by looking up the link
  const linksByBugId = new Map();
  links.forEach(link => {
    if (!linksByBugId.has(link.atBugId)) {
      linksByBugId.set(link.atBugId, []);
    }
    linksByBugId.get(link.atBugId).push(link.commandId);
  });

  return bugs.map(bug => ({
    ...bug.toJSON(),
    commandIds: linksByBugId.get(bug.id) || []
  }));
};

module.exports = atBugsResolver;
