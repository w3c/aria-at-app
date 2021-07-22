const optionalAssertionsPassed = testResult => {
    const { result } = testResult;
    const { details } = result;
    const { summary } = details;

    if (!details || !summary) return 0;

    return summary['2'].pass;
};

module.exports = optionalAssertionsPassed;
