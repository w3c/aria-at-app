const me = require('./me');
const userRoles = require('./User.roles');
const testPlans = require('./testPlans');
const testPlanLatestVersion = require('./testPlanLatestVersion');

const resolvers = {
    Query: {
        me,
        testPlans
    },
    User: {
        roles: userRoles
    },
    TestPlan: {
        latestVersion: testPlanLatestVersion
    }
};

module.exports = resolvers;
