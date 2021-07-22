const assertionCount = testResult => {
    const { result } = testResult;
    const { details } = result;
    const { commands = [] } = details;

    if (!details || !commands.length) return 0;

    // checks to see how much assertions have a priority of '1' (required)
    return commands.reduce(
        (acc, curr) =>
            acc +
            curr.assertions.filter(assertion => assertion.priority === '1')
                .length,
        0
    );
};

module.exports = assertionCount;
