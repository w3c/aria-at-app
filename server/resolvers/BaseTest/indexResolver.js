const index = baseTest => {
    return baseTest.executionOrder || baseTest.test.executionOrder;
};

module.exports = index;
