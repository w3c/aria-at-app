const testFilePath = baseTest => {
    return baseTest.htmlFile || baseTest.test.htmlFile;
};

module.exports = testFilePath;
