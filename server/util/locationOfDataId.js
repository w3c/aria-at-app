const { Base64 } = require('js-base64');

/**
 * The LocationOfData / PopulatedData API in GraphQL allows API consumers to
 * easily load all the data knowable from a single ID, e.g. giving the ID of a
 * Assertion will allow you to load the Test as well as the TestPlanVersion and
 * TestPlan.
 *
 * Generally the API works using the associations defined in Sequelize. But that
 * will not work with types like Test, Scenario, Assertion, TestResult,
 * ScenarioResult and AssertionResult, which are all are defined in the
 * unstructured JSON parts of database.
 *
 * The implementation here encodes a locationOfData into the IDs of those types,
 * allowing the PopulatedData resolver to decode the record's context without
 * needing to bend over backwards to reconstruct it.
 */
const locationOfDataId = {
    /**
     * Encode a locationOfData into an ID for recovery later.
     * @param {object} locationOfData - locationOfData as defined in GraphQL
     * @param {object} uniqueness - Additional data to encode to make sure the
     * IDs are unique, as in the case where the locationOfData would otherwise
     * be identical for multiple entities.
     * @returns {string} - A PopulatedData-aware ID
     */
    encode: (locationOfData, uniqueness = null) => {
        return Base64.encode(
            JSON.stringify([locationOfData, uniqueness]),
            true
        );
    },

    /**
     * Decode the locationOfData needed in the populatedData resolver.
     * @param {string} id - A PopulatedData-aware ID
     * @returns {object} - locationOfData as defined in GraphQL
     */
    decode: id => {
        const [locationOfData] = JSON.parse(Base64.decode(id));
        return locationOfData; // Uniqueness input is not exposed
    }
};

module.exports = locationOfDataId;
