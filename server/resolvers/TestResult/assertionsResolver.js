const assertions = testResult => {
    const { result } = testResult;
    const { details } = result;
    const { commands = [] } = details;

    if (!details || !commands.length) return [];

    const assertions = commands.map(commandObj =>
        commandObj.assertions.map(assertionObj => ({
            command: commandObj.command,
            manualAssertion: assertionObj.assertion,
            priority: assertionObj.priority || '1'
        }))
    );

    return assertions.flat();
};

module.exports = assertions;
