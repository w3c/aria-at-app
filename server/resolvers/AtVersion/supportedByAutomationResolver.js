const { getAtVersionById } = require('../../models/services/AtService');
const {
  isSupportedByAutomation
} = require('../../util/isSupportedByAutomation');

const supportedByAutomationResolver = async (parent, _, { transaction }) => {
  const atVersion = await getAtVersionById({
    id: parent.id,
    transaction
  });
  return isSupportedByAutomation(atVersion.at.id, atVersion.name, {
    transaction
  });
};

module.exports = supportedByAutomationResolver;
