const testResultsResolver = require('../TestPlanRun/testResultsResolver');
const deepCustomMerge = require('../../util/deepCustomMerge');
const {
    getFinalizedTestResults
} = require('../../models/services/TestResultService');

/**
 * Completed test results sourced from all the report's runs. The runs must be
 * merged because each run might have skipped different tests.
 */
const finalizedTestResultsResolver = async testPlanReport =>
    getFinalizedTestResults(testPlanReport);

module.exports = finalizedTestResultsResolver;
