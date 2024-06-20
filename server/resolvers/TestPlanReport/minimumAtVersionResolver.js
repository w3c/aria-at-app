const minimumAtVersionResolver = async (testPlanReport, _, context) => {
    if (!testPlanReport.minimumAtVersionId) return null;

    const { transaction, atLoader } = context;

    const ats = await atLoader.getAll({ transaction });

    const at = ats.find(at => at.id === testPlanReport.atId);

    const atVersion = at.atVersions.find(
        atVersion => atVersion.id === testPlanReport.minimumAtVersionId
    );

    return atVersion;
};

module.exports = minimumAtVersionResolver;
