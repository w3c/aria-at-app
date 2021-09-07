const { getTestPlanRunById } = require('../models/services/TestPlanRunService');
const { AuthenticationError } = require('apollo-server');

const testPlanRunResolver = async (_, { id }, { user }) => {
    const result = await getTestPlanRunById(id);
    if (!result) return null;

    let roles = [...user.roles];
    if (user.roles.length && typeof user.roles[0] === 'object')
        roles = user.roles.map(role => role.name);

    const { testerUserId } = result;

    // if user is admin OR user is tester and their id matches the currently
    // signed in user;
    // then continue
    if (
        !(
            roles.includes('ADMIN') ||
            (roles.includes('TESTER') && testerUserId == user.id)
        )
    ) {
        throw new AuthenticationError('Unauthorized');
    }

    return result;
};

module.exports = testPlanRunResolver;
