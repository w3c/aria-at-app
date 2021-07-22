const isComplete = testResult => {
    return !!testResult.completedAt;
};

module.exports = isComplete;
