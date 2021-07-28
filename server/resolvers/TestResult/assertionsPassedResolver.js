const assertionsPassed = testResult => {
    const { result } = testResult;
    const { details } = result || {};
    const { summary } = details || {};

    if (!details || !summary) return 0;

    return summary.required.pass;
};

module.exports = assertionsPassed;
