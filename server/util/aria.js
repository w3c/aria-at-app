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

    // During comparison for phase update, we need to make sure the assertionId and
    // commandIds hasn't changed so the potentially copied result isn't affected by
    // the assertionStatement, assertionPhrase, settings or instructions content
    // being changed
    if (forUpdateCompare) {
        // Don't factor in settings and instructions changes during update
        propertiesToOmit.push('renderableContent.target.at.settings');
        propertiesToOmit.push('renderableContent.instructions');
        // for v1 format since structure is:
        // { ..., renderableContent: { 1: ..., 2: ... }, ... }
        for (let key in test.renderableContent) {
            test.renderableContent[key] = omit(test.renderableContent[key], [
                'instructions'
            ]);
        }

        // Changed text in renderableContent.assertions[].assertion(Statement|Phrase) shouldn't
        // matter during comparison of results
        propertiesToOmit.push('renderableContent.assertions');
        propertiesToOmit.push('assertions');

        // The collection of scenarios (commands) won't matter during an update comparison;
        // a per-command check will that is handled separately in processCopiedReports.js
        propertiesToOmit.push('renderableContent.commands');
        propertiesToOmit.push('scenarios');

        return {
            ...omit(test, propertiesToOmit)
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
