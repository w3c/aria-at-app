const saveTestResultCommon = require('./saveTestResultCommon');

const saveTestResultResolver = (
    { parentContext: { id: testResultId } },
    { input },
    context
) => {
    const { user } = context;
    return saveTestResultCommon({
        testResultId,
        input,
        user,
        isSubmit: false,
        context
    });
};

module.exports = saveTestResultResolver;
