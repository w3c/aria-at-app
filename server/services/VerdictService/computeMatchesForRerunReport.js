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
          testId: tr.testId,
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
          unexpectedBehaviors: sr.unexpectedBehaviors || null,
          hasUnexpected: sr.hasUnexpected || null,
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
      atId: rerunReport.atId,
      browserId: rerunReport.browserId
    },
    pagination: { order: [['createdAt', 'desc']] },
    transaction
  });
  candidateReports = candidateReports.filter(r => !!r.markedFinalAt);
  // No broader fallbacks; strictly same testPlanVersion + at + browser
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
    for (const cand of pool) {
      if (!outputsMatch(cand.output, currOutput)) continue;
      const isSameScenario = String(cand.scenarioId) === String(scenarioId);
      type = determineType(
        isSameScenario,
        curr.assertionIds,
        cand.assertionIds
      );
      chosen = cand;
      break;
    }

    if (!chosen) {
      result.set(String(scenarioId), { type: MATCH_TYPE.NONE, source: null });
      continue;
    }

    result.set(String(scenarioId), {
      type,
      source: {
        testPlanReportId: chosen.testPlanReportId,
        scenarioId: chosen.scenarioId,
        atVersionId: chosen.atVersionId,
        atVersionName: chosen.atVersionName,
        browserVersionId: chosen.browserVersionId,
        browserVersionName: chosen.browserVersionName,
        output: chosen.output,
        assertionResultsById: chosen.assertionResultsById,
        unexpectedBehaviors: chosen.unexpectedBehaviors || null,
        hasUnexpected: chosen.hasUnexpected || null
      }
    });
  }

  return result;
};

module.exports = {
  computeMatchesForRerunReport,
  MATCH_TYPE
};
