const { getIssues } = require('../TestPlanReport/issuesResolver');

const issuesResolver = (testPlan, _, context) => {
  return getIssues({ testPlan, context });
};

module.exports = issuesResolver;
