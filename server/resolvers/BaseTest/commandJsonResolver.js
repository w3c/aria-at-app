const commandJson = baseTest => {
    return baseTest.commandJson || baseTest.test.commandJson || {};
};

module.exports = commandJson;
