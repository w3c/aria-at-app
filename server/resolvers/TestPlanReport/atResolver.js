const AtLoader = require('../../models/loaders/AtLoader');

const atResolver = async testPlanReport => {
    const atLoader = AtLoader();
    const ats = await atLoader.getAll();

    return ats.find(at => at.id === testPlanReport.atId);
};

module.exports = atResolver;
