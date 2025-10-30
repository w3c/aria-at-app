const checkAssertionResultExceptionMatch = require('../../shared/checkAssertionResultExceptionMatch');
const convertAssertionPriority = require('../../shared/convertAssertionPriority');

const extractFeatureAssertionRows = (
  testPlanReport,
  testPlanReportId,
  finalizedTestResults,
  refId
) => {
  const rows = [];
  let featureInfo = {};

  const testPlanName = testPlanReport.testPlanVersion.testPlan.title;
  const testPlanVersion = testPlanReport.testPlanVersion.versionString;

  finalizedTestResults.forEach(testResult => {
    const testTitle = testResult.test.title;
    const testId = testResult.test.id;

    testResult.scenarioResults.forEach(scenarioResult => {
      scenarioResult.assertionResults.forEach(assertionResult => {
        const assertion = assertionResult.assertion;
        if (!assertion || !assertion.references) return;

        assertion.references.forEach(reference => {
          if (reference.refId !== refId) return;

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
            testResultId: testResult.id,
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
