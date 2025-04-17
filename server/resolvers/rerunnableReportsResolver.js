const {
  getRerunnableTestPlanReportsForVersion
} = require('../models/services/AtVersionService');

const rerunnableReportsResolver = async (_, { atVersionId }, context) => {
  const { transaction } = context;

  const { currentVersion, previousVersionGroups } =
    await getRerunnableTestPlanReportsForVersion({
      currentAtVersionId: atVersionId,
      transaction
    });

  if (!previousVersionGroups?.length) {
    return {
      currentVersion: {
        id: currentVersion.id,
        name: currentVersion.name
      },
      previousVersionGroups: []
    };
  }

  const result = {
    currentVersion: {
      id: currentVersion.id,
      name: currentVersion.name
    },
    previousVersionGroups: previousVersionGroups.map(group => ({
      previousVersion: group.previousVersion,
      reports: group.reports
    }))
  };

  return result;
};

module.exports = rerunnableReportsResolver;
