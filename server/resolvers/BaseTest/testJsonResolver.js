const testJson = baseTest => {
    return baseTest.testJson || baseTest.test.testJson || {};
};

module.exports = testJson;
