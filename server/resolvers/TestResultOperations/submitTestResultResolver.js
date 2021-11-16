const saveTestResultCommon = require('./saveTestResultCommon');

const submitTestResultResolver = (
    { parentContext: { id: testResultId } },
    { input },
    { user }
) => {
    return saveTestResultCommon({
        testResultId,
        input,
        user,
        isSubmit: true
    });
};

module.exports = submitTestResultResolver;
