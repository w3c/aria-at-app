const objectHash = require('object-hash');
const { omit } = require('lodash');

const evaluateAtNameKey = atName => {
    // Could probably add back support for AT keys from the database level
    if (atName.toLowerCase().includes('voiceover')) return 'voiceover_macos';
    else return atName.toLowerCase();
};

const testWithOmittedAttributes = test => ({
    ...omit(test, [
        'id',
        'at',
        'renderedUrls',
        'renderedUrl',
        'renderableContent.target.at.raw',
        'viewers'
    ]),
    assertions: test.assertions.map(assertion => omit(assertion, ['id'])),
    scenarios: test.scenarios.map(scenario => omit(scenario, ['id']))
});

// Ideally the hash of tests being imported will never change
const hashTests = tests => objectHash(tests.map(testWithOmittedAttributes));

// Generate the hash of a test.
const hashTest = test => {
    return objectHash(testWithOmittedAttributes(test));
};

module.exports = {
    evaluateAtNameKey,
    hashTest,
    hashTests
};
