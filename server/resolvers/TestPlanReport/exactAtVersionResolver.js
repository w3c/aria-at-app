const exactAtVersionResolver = async (testPlanReport, _, context) => {
  if (!testPlanReport.exactAtVersionId) return null;

  const { transaction, atLoader } = context;

  const ats = await atLoader.getAll({ transaction });

  const at = ats.find(at => at.id === testPlanReport.atId);

  const atVersion = at.atVersions.find(
    atVersion => atVersion.id === testPlanReport.exactAtVersionId
  );

  return atVersion;
};

module.exports = exactAtVersionResolver;
