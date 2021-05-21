const me = require('./meResolver');
const testPlans = require('./testPlansResolver');
const User = require('./User');
const TestPlan = require('./TestPlan');
const TestPlanVersion = require('./TestPlanVersion');
const TestPlanReport = require('./TestPlanReport');

const resolvers = {
    Query: {
        me,
        testPlans
    },
    User,
    TestPlan,
    TestPlanVersion,
    TestPlanReport
};

module.exports = resolvers;
