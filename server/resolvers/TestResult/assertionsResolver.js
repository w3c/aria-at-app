const assertions = (testResult, { priority }) => {
    const { result } = testResult;
    const { details } = result || {};
    const { commands = [] } = details || {};

    if (!details || !commands.length) return [];

    const assertionsData = commands.map(commandObj =>
        commandObj.assertions.map(assertionObj => ({
            command: commandObj.command,
            manualAssertion: assertionObj.assertion,
            priority: assertionObj.priority || '1'
        }))
    );

    let assertions = [];

    if (!priority) assertions = assertionsData.flat();
    if (priority === 'REQUIRED')
        assertions = assertionsData
            .flat()
            .filter(each => each.priority === '1');
    if (priority === 'OPTIONAL')
        assertions = assertionsData
            .flat()
            .filter(each => each.priority === '2');

    return assertions;
};

module.exports = assertions;
