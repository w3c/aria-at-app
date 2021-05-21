const me = require('./meResolver');
const testPlans = require('./testPlansResolver');
const User = require('./User');
const TestPlan = require('./TestPlan');
const TestPlanVersion = require('./TestPlanVersion');

const resolvers = {
    Query: {
        me,
        testPlans
    },
    User,
    TestPlan,
    TestPlanVersion
};

module.exports = resolvers;
