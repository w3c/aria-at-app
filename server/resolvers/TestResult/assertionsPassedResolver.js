const assertionsPassed = (testResult, { priority }) => {
    const { result } = testResult;
    const { details } = result || {};
    const { summary } = details || {};

    if (!details || !summary) return 0;

    if (!priority) return summary.required.pass + summary.required.fail;
    if (priority === 'REQUIRED') return summary.required.pass;
    if (priority === 'OPTIONAL') return summary.optional.pass;
};

module.exports = assertionsPassed;
