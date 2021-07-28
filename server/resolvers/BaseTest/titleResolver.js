const title = baseTest => {
    return baseTest.testFullName || baseTest.test.testFullName;
};

module.exports = title;
