const scripts = baseTest => {
    return baseTest.scripts || baseTest.test.scripts || '';
};

module.exports = scripts;
