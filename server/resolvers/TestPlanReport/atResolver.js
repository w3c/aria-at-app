const atResolver = async (testPlanReport, _, context) => {
    const ats = await context.atLoader.getAll();

    return ats.find(at => at.id === testPlanReport.at.id);
};

module.exports = atResolver;
