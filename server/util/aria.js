const objectHash = require('object-hash');
const { omit } = require('lodash');

const evaluateAtNameKey = atName => {
    // Could probably add back support for AT keys from the database level
    if (atName.toLowerCase().includes('voiceover')) return 'voiceover_macos';
    else return atName.toLowerCase();
};

const testWithModifiedAttributes = (test, { forUpdateCompare }) => {
    let propertiesToOmit = [
        'id',
        'at',
        'renderedUrls',
        'renderedUrl',
        'renderableContent.target.at.raw',
        'viewers'
    ];

    // During comparison for phase update, we only need to make sure the assertionId hasn't
    // changed so the potentially copied result isn't affected by the assertionStatement or
    // assertionPhrase being changed
    if (forUpdateCompare) {
        // Changed text in renderableContent.assertions[].assertion(Statement|Phrase) shouldn't
        // matter during comparison of results
        propertiesToOmit.push('renderableContent.assertions');

        // The collection of assertions won't matter during an update comparison; a per-assertion
        // check will that is handled separately in processCopiedReports.js
        propertiesToOmit.push('assertions');

        return {
            ...omit(test, propertiesToOmit),
            scenarios: test.scenarios.map(scenario => omit(scenario, ['id']))
        };
    } else {
        return {
            ...omit(test, propertiesToOmit),
            assertions: test.assertions.map(assertion =>
                omit(assertion, ['id'])
            ),
            scenarios: test.scenarios.map(scenario => omit(scenario, ['id']))
        };
    }
};

// Ideally the hash of tests being imported will never change
const hashTests = tests => objectHash(tests.map(testWithModifiedAttributes));

// Generate the hash of a test.
const hashTest = (test, { forUpdateCompare = false } = {}) => {
    return objectHash(testWithModifiedAttributes(test, { forUpdateCompare }));
};

module.exports = {
    evaluateAtNameKey,
    hashTest,
    hashTests
};
