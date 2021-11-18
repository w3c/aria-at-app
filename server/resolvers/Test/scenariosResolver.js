const scenariosResolver = (test, { atId }) => {
    if (!atId) return test.scenarios;
    return test.scenarios.filter(scenario => scenario.atId == atId);
};

module.exports = scenariosResolver;
