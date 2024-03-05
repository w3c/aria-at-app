const scenariosResolver = (
    test,
    { atId },
    context // eslint-disable-line no-unused-vars
) => {
    if (!atId) return test.scenarios;
    return test.scenarios.filter(scenario => scenario.atId == atId);
};

module.exports = scenariosResolver;
