const AtLoader = require('../../models/loaders/AtLoader');

const atResolver = async (testPlanReport, _, context) => {
    const { transaction } = context;

    const atLoader = AtLoader();
    const ats = await atLoader.getAll({ transaction });

    return ats.find(at => at.id === testPlanReport.atId);
};

module.exports = atResolver;
