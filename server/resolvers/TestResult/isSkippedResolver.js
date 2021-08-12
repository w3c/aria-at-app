const isSkipped = testResult => {
    // A partially complete test is a test that is skipped. A test is skipped
    // if no 'result' exists for it but a 'serializedForm' does.
    // A serializedForm always exists for a complete or partially complete test
    return !!testResult.serializedForm && !testResult.result;
};

module.exports = isSkipped;
