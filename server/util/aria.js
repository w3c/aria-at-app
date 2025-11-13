const objectHash = require('object-hash');
const { omit } = require('lodash');

const evaluateAtNameKey = atName => {
  // Could probably add back support for AT keys from the database level
  if (atName.toLowerCase().includes('voiceover')) return 'voiceover_macos';
  else return atName.toLowerCase();
};

/**
 * Prepares test for hashing by removing equivalence-irrelevant attributes.
 * Normal mode: removes IDs/URLs, keeps semantic content.
 * forUpdateCompare mode: aggressive filtering - removes text/settings/instructions (checks IDs only).
 * Allows result preservation for non-structural changes (rewording) while detecting behavior changes.
 *
 * @param {Object} test - Test object
 * @param {Object} options
 * @param {boolean} [options.forUpdateCompare=false] - Aggressive filtering for version comparison
 * @returns {Object} Test with omitted properties
 */
const testWithModifiedAttributes = (test, { forUpdateCompare }) => {
  let propertiesToOmit = [
    'id',
    'at',
    'renderedUrls',
    'renderedUrl',
    'renderableContent.target.at.raw'
  ];

  // During comparison for phase update, we need to make sure the assertionId and
  // commandIds hasn't changed so the potentially copied result isn't affected by
  // the assertionStatement, assertionPhrase, settings or instructions content
  // being changed
  if (forUpdateCompare) {
    // Don't factor in settings, instructions and references changes for
    // update eligibility in the case where ONLY the settings, instructions or
    // references has changed.
    // The updated settings, instructions or references should be shown when
    // the copy process is done
    propertiesToOmit.push('renderableContent.target.at.settings');
    propertiesToOmit.push('renderableContent.target.referencePage');
    propertiesToOmit.push('renderableContent.instructions');
    propertiesToOmit.push('renderableContent.info.references');
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
      assertions: test.assertions.map(assertion => omit(assertion, ['id'])),
      scenarios: test.scenarios.map(scenario => omit(scenario, ['id']))
    };
  }
};

// Ideally the hash of tests being imported will never change
const hashTests = tests => objectHash(tests.map(testWithModifiedAttributes));

/**
 * Generates deterministic hash for test equality comparison across versions.
 * Uses object-hash on normalized attributes. Same hash = equivalent tests, enables result sharing.
 *
 * @param {Object} test - Test object
 * @param {Object} [options={}]
 * @param {boolean} [options.forUpdateCompare=false] - Aggressive filtering for version comparison
 * @returns {string} Hash representing structural identity
 */
const hashTest = (test, { forUpdateCompare = false } = {}) => {
  return objectHash(testWithModifiedAttributes(test, { forUpdateCompare }));
};

module.exports = {
  evaluateAtNameKey,
  hashTest,
  hashTests
};
