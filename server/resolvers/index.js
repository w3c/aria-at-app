const me = require('./meResolver');
const testPlans = require('./testPlansResolver');
const User = require('./User');
const TestPlanVersion = require('./TestPlanVersion');
const TestPlanReport = require('./TestPlanReport');
const TestPlanRun = require('./TestPlanRun');

const resolvers = {
    Query: {
        me,
        testPlans
    },
    User,
    TestPlanVersion,
    TestPlanReport,
    TestPlanRun
};

module.exports = resolvers;
