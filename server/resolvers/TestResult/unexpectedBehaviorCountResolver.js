const unexpectedBehaviorCount = testResult => {
    const { result } = testResult;
    const { details } = result;
    const { summary } = details;

    if (!details || !summary) return 0;

    return summary.unexpectedCount;
};

module.exports = unexpectedBehaviorCount;
