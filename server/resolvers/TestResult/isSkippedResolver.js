const isSkipped = testResult => {
    // A partially complete test is a test that is skipped. A test is skipped
    // if no 'result' exists for it but a 'state' does.
    // A state always exists for a complete or partially complete test form

    return !!testResult.state && !testResult.result;
};

module.exports = isSkipped;
