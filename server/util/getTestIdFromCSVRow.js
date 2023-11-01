const getTestIdFromCSVRow = (row, testPlanVersion) => {
    return testPlanVersion.tests[row].id;
};

module.exports = { getTestIdFromCSVRow };
