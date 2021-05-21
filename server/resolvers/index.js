const me = require('./me');
const User_roles = require('./User.roles');
const testPlans = require('./testPlans');
const TestPlan = require('./TestPlan');
const TestPlanVersion = require('./TestPlanVersion');

const resolvers = {
    Query: {
        me,
        testPlans
    },
    User: {
        roles: User_roles
    },
    TestPlan,
    TestPlanVersion
};

module.exports = resolvers;
