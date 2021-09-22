const saveTestResultCommon = require('./saveTestResultCommon');

const saveTestResultResolver = (
    { parentContext: { id: testResultId } },
    { input },
    { user }
) => {
    return saveTestResultCommon({
        testResultId,
        input,
        user,
        isSubmit: false
    });
};

module.exports = saveTestResultResolver;
