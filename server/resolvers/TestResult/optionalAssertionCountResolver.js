const optionalAssertionCount = testResult => {
    const { result } = testResult;
    const { details } = result;
    const { commands = [] } = details;

    if (!details || !commands.length) return 0;

    // checks to see how much assertions have a priority of '2' (optional)
    return commands.reduce(
        (acc, curr) =>
            acc +
            curr.assertions.filter(assertion => assertion.priority === '2')
                .length,
        0
    );
};

module.exports = optionalAssertionCount;
