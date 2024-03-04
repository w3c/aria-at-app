const { getIssues } = require('../TestPlanReport/issuesResolver');

const issuesResolver = (testPlan, _, context) => {
    const { transaction } = context;

    return getIssues({ testPlan, transaction });
};

module.exports = issuesResolver;
