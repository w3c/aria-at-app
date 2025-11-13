const { outputsMatch } = require('../../util/outputNormalization');
const {
  getTestPlanReportById,
  getTestPlanReports
} = require('../../models/services/TestPlanReportService');
const {
  getFinalizedTestResults
} = require('../../models/services/TestResultReadService');

const MATCH_TYPE = {
  SAME_SCENARIO: 'SAME_SCENARIO',
  CROSS_SCENARIO: 'CROSS_SCENARIO',
  INCOMPLETE: 'INCOMPLETE',
  NONE: 'NONE'
};

/**
 * Builds map of scenario IDs to current test result data from rerun report.
 * Extracts scenario data from test results or uses currentOutputsByScenarioId override for live updates.
 *
 * @param {Object} rerunReport - Rerun test plan report
 * @param {Object} [currentOutputsByScenarioId] - Optional output overrides
 * @returns {Map<string, Object>} ScenarioId → {testId, scenarioId, output, assertionIds}
 */
const buildCurrentScenarioMap = (rerunReport, currentOutputsByScenarioId) => {
  const map = new Map();
  for (const run of rerunReport.testPlanRuns || []) {
    for (const testResult of run.testResults || []) {
      for (const scenarioResult of testResult.scenarioResults || []) {
        map.set(String(scenarioResult.scenarioId), {
          testId: testResult.testId,
          scenarioId: scenarioResult.scenarioId,
          output:
            (currentOutputsByScenarioId &&
              currentOutputsByScenarioId[String(scenarioResult.scenarioId)]) ||
            scenarioResult.output,
          assertionIds: new Set(
            (scenarioResult.assertionResults || []).map(a => a.assertionId)
          )
        });
      }
    }
  }
  return map;
};

/**
 * Extracts finalized scenario results from candidate reports for matching.
 * Flattens TestPlanReports → FinalizedTestResults → ScenarioResults into flat array
 * with all metadata for verdict copying (outputs, assertions, side effects, versions).
 *
 * @param {Array<Object>} candidateReports - Finalized TestPlanReports
 * @param {Object} context - GraphQL context
 * @returns {Promise<Array<Object>>} Scenario entries with all matching/copying metadata
 */
const buildCandidateEntries = async (candidateReports, context) => {
  const entries = [];
  for (const report of candidateReports) {
    const finalizedResults = await getFinalizedTestResults({
      testPlanReport: report,
      context
    });
    if (!finalizedResults) continue;
    for (const tr of finalizedResults) {
      for (const sr of tr.scenarioResults || []) {
        entries.push({
          testPlanReportId: report.id,
          createdAt: report.createdAt,
          testPlanVersionId: report.testPlanVersionId,
          testId: tr.testId,
          testResultId: tr.id,
          scenarioId: sr.scenario.id,
          output: sr.output,
          assertionIds: new Set(
            (sr.assertionResults || []).map(
              a => a.assertion?.id ?? a.assertionId
            )
          ),
          assertionResultsById: Object.fromEntries(
            (sr.assertionResults || []).map(a => [
              String(a.assertion?.id ?? a.assertionId),
              { passed: a.passed, failedReason: a.failedReason }
            ])
          ),
          negativeSideEffects: sr.negativeSideEffects || null,
          hasNegativeSideEffect: sr.hasNegativeSideEffect || null,
          atVersionId: tr.atVersion?.id ?? null,
          atVersionName: tr.atVersion?.name ?? null,
          browserVersionId: tr.browserVersion?.id ?? null,
          browserVersionName: tr.browserVersion?.name ?? null
        });
      }
    }
  }
  return entries;
};

/**
 * Determines match type for verdict copying reliability.
 * SAME_SCENARIO: exact match + exact assertions. CROSS_SCENARIO: different scenario + exact assertions.
 * INCOMPLETE: assertion sets differ (new/removed assertions lack historical verdicts).
 *
 * @param {boolean} isSameScenario - Scenario IDs match
 * @param {Set<string>} currentIds - Rerun assertion IDs
 * @param {Set<string>} sourceIds - Candidate assertion IDs
 * @returns {string} MATCH_TYPE constant
 */
const determineType = (isSameScenario, currentIds, sourceIds) => {
  const currentOnly = [...currentIds].filter(id => !sourceIds.has(id));
  const sourceOnly = [...sourceIds].filter(id => !currentIds.has(id));
  if (
    currentIds.size > 0 &&
    sourceIds.size > 0 &&
    (currentOnly.length > 0 || sourceOnly.length > 0)
  )
    return MATCH_TYPE.INCOMPLETE;
  return isSameScenario ? MATCH_TYPE.SAME_SCENARIO : MATCH_TYPE.CROSS_SCENARIO;
};

/**
 * Finds best historical matches for rerun report scenarios to enable verdict copying.
 * Strategy: SAME_SCENARIO (exact) → CROSS_SCENARIO (different scenario, same output) → NONE (fallback reference).
 * Uses normalized output comparison. Prioritizes same test, then broadens. Returns null if no finalized candidates.
 *
 * @param {Object} params
 * @param {string} params.rerunTestPlanReportId - Rerun report ID
 * @param {Object} params.context - GraphQL context
 * @param {number} [params.candidatesLimit] - Optional candidate limit
 * @param {Object} [params.currentOutputsByScenarioId] - Live output overrides
 * @returns {Promise<Map<string, Object>|null>} ScenarioId → {type, source with verdict data}, or null
 */
const computeMatchesForRerunReport = async ({
  rerunTestPlanReportId,
  context,
  candidatesLimit,
  currentOutputsByScenarioId
}) => {
  const { transaction } = context;
  const rerunReport = await getTestPlanReportById({
    id: rerunTestPlanReportId,
    transaction
  });
  if (!rerunReport) return new Map();

  let candidateReports = await getTestPlanReports({
    where: {
      testPlanVersionId: rerunReport.testPlanVersionId,
      atId: rerunReport.atId
    },
    pagination: { order: [['createdAt', 'desc']] },
    transaction
  });
  candidateReports = candidateReports.filter(r => !!r.markedFinalAt);
  // If there are no finalized candidate reports, indicate that no comparison is available
  if (candidateReports.length === 0) {
    return null;
  }
  // No broader fallbacks; strictly same testPlanVersion + at, allowing any browser
  if (typeof candidatesLimit === 'number') {
    candidateReports = candidateReports.slice(0, candidatesLimit);
  }

  let currentMap = buildCurrentScenarioMap(
    rerunReport,
    currentOutputsByScenarioId
  );

  if (currentMap.size === 0 && currentOutputsByScenarioId) {
    const scenarioToTestId = new Map();
    const tests = rerunReport.testPlanVersion?.tests || [];
    for (const t of tests) {
      for (const sc of t.scenarios || []) {
        scenarioToTestId.set(String(sc.id), t.id);
      }
    }
    for (const [scenarioId, output] of Object.entries(
      currentOutputsByScenarioId
    )) {
      const testId = scenarioToTestId.get(String(scenarioId)) || null;
      currentMap.set(String(scenarioId), {
        testId,
        scenarioId: Number(scenarioId),
        output,
        assertionIds: new Set()
      });
    }
  }

  const candidateEntries = await buildCandidateEntries(
    candidateReports,
    context
  );

  const byTestId = new Map();
  const byScenarioId = new Map();
  for (const e of candidateEntries) {
    if (!byTestId.has(String(e.testId))) byTestId.set(String(e.testId), []);
    byTestId.get(String(e.testId)).push(e);
    if (!byScenarioId.has(String(e.scenarioId)))
      byScenarioId.set(String(e.scenarioId), []);
    byScenarioId.get(String(e.scenarioId)).push(e);
  }

  const result = new Map();
  for (const [scenarioId, curr] of currentMap.entries()) {
    const currOutput = curr.output;
    let chosen = null;
    let type = MATCH_TYPE.NONE;

    const pool = (
      curr.testId ? byTestId.get(String(curr.testId)) || [] : candidateEntries
    )
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Prefer SAME_SCENARIO matches first
    const sameScenarioCandidate = pool.find(
      cand =>
        String(cand.scenarioId) === String(scenarioId) &&
        outputsMatch(cand.output, currOutput)
    );
    if (sameScenarioCandidate) {
      chosen = sameScenarioCandidate;
      type = determineType(true, curr.assertionIds, chosen.assertionIds);
    }

    // If no SAME_SCENARIO, then consider CROSS_SCENARIO
    if (!chosen) {
      const crossScenarioCandidate = pool.find(
        cand =>
          String(cand.scenarioId) !== String(scenarioId) &&
          outputsMatch(cand.output, currOutput)
      );
      if (crossScenarioCandidate) {
        chosen = crossScenarioCandidate;
        type = determineType(false, curr.assertionIds, chosen.assertionIds);
      }
    }

    if (!chosen) {
      // Provide fallback source: most recent finalized same-scenario entry
      const sameScenarioEntries = (byScenarioId.get(String(scenarioId)) || [])
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const fallback = sameScenarioEntries[0] || null;
      const source = fallback
        ? {
            testPlanReportId: fallback.testPlanReportId,
            testPlanVersionId: fallback.testPlanVersionId,
            testResultId: fallback.testResultId,
            scenarioId: fallback.scenarioId,
            atVersionId: fallback.atVersionId,
            atVersionName: fallback.atVersionName,
            browserVersionId: fallback.browserVersionId,
            browserVersionName: fallback.browserVersionName,
            output: fallback.output,
            assertionResultsById: fallback.assertionResultsById,
            negativeSideEffects: fallback.negativeSideEffects || null,
            hasNegativeSideEffect: fallback.hasNegativeSideEffect || null
          }
        : null;
      result.set(String(scenarioId), { type: MATCH_TYPE.NONE, source });
      continue;
    }

    result.set(String(scenarioId), {
      type,
      source: {
        testPlanReportId: chosen.testPlanReportId,
        testPlanVersionId: chosen.testPlanVersionId,
        testResultId: chosen.testResultId,
        scenarioId: chosen.scenarioId,
        atVersionId: chosen.atVersionId,
        atVersionName: chosen.atVersionName,
        browserVersionId: chosen.browserVersionId,
        browserVersionName: chosen.browserVersionName,
        output: chosen.output,
        assertionResultsById: chosen.assertionResultsById,
        negativeSideEffects: chosen.negativeSideEffects || null,
        hasNegativeSideEffect: chosen.hasNegativeSideEffect || null
      }
    });
  }

  return result;
};

module.exports = {
  computeMatchesForRerunReport,
  MATCH_TYPE
};
