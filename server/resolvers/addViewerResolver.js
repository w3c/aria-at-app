const { AuthenticationError } = require('apollo-server-errors');
const {
    getTestPlanVersionById,
    updateTestPlanVersionById
} = require('../models/services/TestPlanVersionService');

const addViewerResolver = async (_, { testPlanVersionId, testId }, context) => {
    const { user, t } = context;

    if (
        !(
            user?.roles.find(role => role.name === 'ADMIN') ||
            user?.roles.find(role => role.name === 'VENDOR')
        )
    ) {
        throw new AuthenticationError();
    }

    const testPlanVersion = await getTestPlanVersionById({
        id: testPlanVersionId,
        t
    });
    const currentTest = testPlanVersion.tests.find(each => each.id === testId);
    if (!currentTest.viewers) currentTest.viewers = [user];
    else {
        const viewer = currentTest.viewers.find(each => each.id === user.id);
        if (!viewer) currentTest.viewers.push(user);
    }

    await updateTestPlanVersionById({
        id: testPlanVersionId,
        values: { tests: testPlanVersion.tests },
        t
    });

    return user;
};

module.exports = addViewerResolver;
