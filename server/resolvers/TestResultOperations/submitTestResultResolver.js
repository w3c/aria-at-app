const saveTestResultCommon = require('./saveTestResultCommon');

const submitTestResultResolver = (
    { parentContext: { id: testResultId } },
    { input },
    context
) => {
    const { user } = context;
    return saveTestResultCommon({
        testResultId,
        input,
        user,
        isSubmit: true,
        context
    });
};

module.exports = submitTestResultResolver;
