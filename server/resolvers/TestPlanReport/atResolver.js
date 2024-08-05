const atResolver = async (testPlanReport, _, context) => {
  const { transaction, atLoader } = context;

  const ats = await atLoader.getAll({ transaction });

  return ats.find(at => at.id === testPlanReport.atId);
};

module.exports = atResolver;
