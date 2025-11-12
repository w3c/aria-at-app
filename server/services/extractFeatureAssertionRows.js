const checkAssertionResultExceptionMatch = require('../../shared/checkAssertionResultExceptionMatch');
const convertAssertionPriority = require('../../shared/convertAssertionPriority');

/**
 * Extracts assertion rows from finalized test results that match a specific feature reference.
 * Filters assertions based on reference ID and type, and collects feature information from
 * the first matching reference. Only includes assertions that match exception criteria
 * (MUST or SHOULD priority).
 *
 * @param {Object} testPlanReport - The test plan report object containing test plan version,
 *   AT, and browser information
 * @param {number} testPlanReportId - The ID of the test plan report
 * @param {Array<Object>} finalizedTestResults - Array of finalized test result objects,
 *   each containing test, scenarioResults, atVersion, browserVersion, and completedAt
 * @param {string} refId - The reference ID to filter assertions by
 * @param {string} [refType] - Optional reference type to further filter assertions
 * @param {Object<string, number>} [testIdToResultIdMap={}] - Optional mapping of test IDs
 *   to test result IDs for remapping test result IDs
 * @returns {Object} An object containing:
 *   - {Array<Object>} rows - Array of assertion row objects with test plan, test, assertion,
 *     and result information
 *   - {Object} featureInfo - Object containing refId, type, linkText, and value from the
 *     first matching reference
 */
const extractFeatureAssertionRows = (
  testPlanReport,
  testPlanReportId,
  finalizedTestResults,
  refId,
  refType,
  testIdToResultIdMap = {}
) => {
  const rows = [];
  let featureInfo = {};

  const testPlanName = testPlanReport.testPlanVersion.testPlan.title;
  const testPlanVersion = testPlanReport.testPlanVersion.versionString;

  finalizedTestResults.forEach(testResult => {
    const testTitle = testResult.test.title;
    const testId = testResult.test.id;
    const mappedTestResultId = testIdToResultIdMap[testId] ?? testResult.id;

    testResult.scenarioResults.forEach(scenarioResult => {
      scenarioResult.assertionResults.forEach(assertionResult => {
        const assertion = assertionResult.assertion;
        if (!assertion || !assertion.references) return;

        assertion.references.forEach(reference => {
          if (reference.refId !== refId) return;
          if (refType && reference.type !== refType) return;

          if (!featureInfo.refId) {
            featureInfo.refId = reference.refId;
            featureInfo.type = reference.type;
            featureInfo.linkText = reference.linkText;
            featureInfo.value = reference.value;
          }

          if (
            !checkAssertionResultExceptionMatch(
              assertionResult,
              scenarioResult,
              'MUST'
            ) &&
            !checkAssertionResultExceptionMatch(
              assertionResult,
              scenarioResult,
              'SHOULD'
            )
          ) {
            return;
          }

          const severeSideEffects =
            scenarioResult.negativeSideEffects?.filter(
              se => se.impact === 'SEVERE'
            )?.length || 0;
          const moderateSideEffects =
            scenarioResult.negativeSideEffects?.filter(
              se => se.impact === 'MODERATE'
            )?.length || 0;

          const result = scenarioResult.untestable
            ? 'Untestable'
            : assertionResult.passed
            ? 'Passed'
            : 'Failed';

          rows.push({
            testPlanName,
            testPlanVersion,
            testPlanVersionId: testPlanReport.testPlanVersionId,
            testPlanReportId: testPlanReport.id,
            testTitle,
            testId,
            testResultId: mappedTestResultId,
            commandSequence: scenarioResult.scenario.commands
              .map(cmd => cmd.text)
              .join(' then '),
            assertionPriority:
              convertAssertionPriority(assertion.priority) === 'MUST'
                ? 'Must'
                : 'Should',
            assertionPhrase: assertion.phrase || assertion.text,
            result,
            testedOn: testResult.completedAt
              ? new Date(testResult.completedAt).toISOString().split('T')[0]
              : null,
            atVersion: testResult.atVersion?.name || 'N/A',
            browserVersion: testResult.browserVersion?.name || 'N/A',
            atName: testPlanReport.at?.name || 'N/A',
            browserName: testPlanReport.browser?.name || 'N/A',
            severeSideEffectsCount: severeSideEffects,
            moderateSideEffectsCount: moderateSideEffects
          });
        });
      });
    });
  });

  return { rows, featureInfo };
};

module.exports = extractFeatureAssertionRows;
