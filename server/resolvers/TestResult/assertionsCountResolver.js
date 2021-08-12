const assertionsCount = (testResult, { priority }) => {
    const { result } = testResult;
    const { details } = result || {};
    const { commands = [] } = details || {};

    if (!details || !commands.length) return 0;

    if (!priority)
        return commands.reduce((acc, curr) => acc + curr.assertions.length, 0);

    // checks to see how much assertions have a priority of '1' (required)
    if (priority === 'REQUIRED')
        return commands.reduce(
            (acc, curr) =>
                acc +
                curr.assertions.filter(assertion => assertion.priority === '1')
                    .length,
            0
        );

    // checks to see how much assertions have a priority of '2' (optional)
    if (priority === 'OPTIONAL')
        return commands.reduce(
            (acc, curr) =>
                acc +
                curr.assertions.filter(assertion => assertion.priority === '2')
                    .length,
            0
        );
};

module.exports = assertionsCount;
