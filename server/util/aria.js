const objectHash = require('object-hash');
const { omit, pick } = require('lodash');

const evaluateAtNameKey = atName => {
    // Could probably add back support for AT keys from the database level
    if (atName.toLowerCase().includes('voiceover')) return 'voiceover_macos';
    else return atName.toLowerCase();
};

const assertionWithModifiedAttributes = (assertion, { forUpdateCompare }) => {
    // During comparison for phase update, we only need to make sure the assertionId hasn't
    // changed, so the result isn't affected by the text changing
    // if (forUpdateCompare) return omit(assertion, ['assertionId']);
    if (forUpdateCompare) return pick(assertion, ['assertionId']);
    return omit(assertion, ['id']);
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

    if (forUpdateCompare) {
        // Changed text in renderableContent.assertions[].assertion(Statement|Phrase) shouldn't matter
        // during comparison of results
        propertiesToOmit.push('renderableContent.assertions');

        // The collection of assertions won't matter during a update comparison; a per assertion
        // check will
        propertiesToOmit.push('assertions');

        return {
            ...omit(test, propertiesToOmit),
            scenarios: test.scenarios.map(scenario => omit(scenario, ['id']))
        };
    } else {
        return {
            ...omit(test, propertiesToOmit),
            assertions: test.assertions.map(assertionWithModifiedAttributes),
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
