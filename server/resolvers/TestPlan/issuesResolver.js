const { getIssues } = require('../TestPlanReport/issuesResolver');

const issuesResolver = (testPlan, _, context) =>
    getIssues({ testPlan, context });

module.exports = issuesResolver;
