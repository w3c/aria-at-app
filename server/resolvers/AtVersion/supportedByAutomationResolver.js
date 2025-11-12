const { getAtVersionById } = require('../../models/services/AtVersionService');

const supportedByAutomationResolver = async (parent, _, { transaction }) => {
  const atVersion = await getAtVersionById({
    id: parent.id,
    transaction
  });
  return atVersion.supportedByAutomation;
};

module.exports = supportedByAutomationResolver;
