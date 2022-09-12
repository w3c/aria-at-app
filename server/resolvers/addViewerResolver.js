const { AuthenticationError } = require('apollo-server-errors');
const {
    getTestPlanVersionById,
    updateTestPlanVersion
} = require('../models/services/TestPlanVersionService');

const addViewerResolver = async (
    _,
    { testPlanVersionId, testId },
    { user }
) => {
    if (
        !(
            user?.roles.find(role => role.name === 'ADMIN') ||
            user?.roles.find(role => role.name === 'VENDOR')
        )
    ) {
        throw new AuthenticationError();
    }

    const testPlanVersion = await getTestPlanVersionById(testPlanVersionId);
    const currentTest = testPlanVersion.tests.find(each => each.id === testId);
    const viewer = currentTest.viewers.find(each => each.id === user.id);
    if (!viewer) currentTest.viewers.push(user);

    await updateTestPlanVersion(testPlanVersionId, {
        tests: testPlanVersion.tests
    });

    return user;
};

module.exports = addViewerResolver;
