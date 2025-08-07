const dbCleaner = require('../util/db-cleaner');
const { query, mutate } = require('../util/graphql-test-utilities');
const db = require('../../models');
const { gql } = require('apollo-server-core');

const atVersionId = 1;
const browserVersionId = 1;
jest.setTimeout(30000);

const findV2TestWithScenarioSpecificExclude = async () => {
  const testPlanVersions = await db.TestPlanVersion.findAll({ raw: false });
  for (const tpv of testPlanVersions) {
    if (tpv.metadata?.testFormatVersion !== 2) continue;
    const tests = tpv.tests || [];
    for (const test of tests) {
      const assertions = test.assertions || [];
      const scenarios = test.scenarios || [];
      for (const scenario of scenarios) {
        const scenarioCommandId = (scenario.commandIds || []).join(' ');
        if (!scenarioCommandId.includes(' ')) continue; // require multi-command sequence
        const scenarioSettings = scenario.settings;
        const hasMatchingExclude = assertions.some(a =>
          (a.assertionExceptions || []).some(
            e =>
              e.priority === 'EXCLUDE' &&
              e.commandId === scenarioCommandId &&
              e.settings === scenarioSettings
          )
        );
        if (hasMatchingExclude) {
          return { tpv, test, scenario };
        }
      }
    }
  }
  return null;
};

const findV2TestWithBaseExclude = async () => {
  const testPlanVersions = await db.TestPlanVersion.findAll({ raw: false });
  for (const tpv of testPlanVersions) {
    if (tpv.metadata?.testFormatVersion !== 2) continue;
    const tests = tpv.tests || [];
    for (const test of tests) {
      const assertions = test.assertions || [];
      if (assertions.some(a => a.priority === 'EXCLUDE')) {
        const scenario = (test.scenarios || [])[0];
        if (scenario) return { tpv, test, scenario };
      }
    }
  }
  return null;
};

describe('createTestResultSkeleton', () => {
  afterAll(async () => {
    await db.sequelize.close();
  });

  it('excludes assertions with base EXCLUDE priority in v2 tests', async () => {
    await dbCleaner(async transaction => {
      const data = await findV2TestWithBaseExclude();
      // If database changes in the future, this may need to be uncommented
      // if (!data) return; // Skip if fixture data not available
      const { tpv, test, scenario } = data;

      const createReport = await mutate(
        gql`
          mutation {
            createTestPlanReport(
              input: {
                testPlanVersionId: ${tpv.id}
                atId: ${scenario.atId}
                minimumAtVersionId: ${atVersionId}
                browserId: ${1}
              }
            ) {
              testPlanReport { id runnableTests { id } }
            }
          }
        `,
        { transaction }
      );
      const testPlanReportId =
        createReport.createTestPlanReport.testPlanReport.id;

      const assign = await mutate(
        gql`
          mutation { testPlanReport(id: ${testPlanReportId}) { assignTester(userId: 1) { testPlanRun { id } } } }
        `,
        { transaction }
      );
      const testPlanRunId = assign.testPlanReport.assignTester.testPlanRun.id;

      const fr = await mutate(
        gql`
          mutation {
            testPlanRun(id: ${testPlanRunId}) {
              findOrCreateTestResult(
                testId: "${test.id}",
                atVersionId: "${atVersionId}",
                browserVersionId: "${browserVersionId}"
              ) {
                testResult {
                  id
                  scenarioResults { id scenario { id } assertionResults { id assertion { id } } }
                }
              }
            }
          }
        `,
        { transaction }
      );
      const { testResult } = fr.testPlanRun.findOrCreateTestResult;
      const sr = testResult.scenarioResults.find(
        s => s.scenario.id === scenario.id
      );

      const dataQuery = await query(
        gql`
          query {
            populateData(locationOfData: { testResultId: "${testResult.id}" }) {
              testResult {
                scenarioResults {
                  id
                  base: assertionResults { assertion { id } }
                  must: assertionResults(priority: MUST) { assertion { id } }
                  should: assertionResults(priority: SHOULD) { assertion { id } }
                  may: assertionResults(priority: MAY) { assertion { id } }
                }
              }
            }
          }
        `,
        { transaction }
      );
      const scenarioEntry =
        dataQuery.populateData.testResult.scenarioResults.find(
          s => s.id === sr.id
        );
      const unionIds = new Set([
        ...scenarioEntry.must.map(x => x.assertion.id),
        ...scenarioEntry.should.map(x => x.assertion.id),
        ...scenarioEntry.may.map(x => x.assertion.id)
      ]);
      const baseIds = new Set(scenarioEntry.base.map(x => x.assertion.id));
      expect(baseIds.size).toBe(unionIds.size);
      for (const id of baseIds) expect(unionIds.has(id)).toBe(true);
    });
  });

  it('excludes assertions with scenario-specific EXCLUDE exceptions for multi-command sequences in v2 tests', async () => {
    await dbCleaner(async transaction => {
      const data = await findV2TestWithScenarioSpecificExclude();
      // If database changes in the future, this may need to be uncommented
      // if (!data) return; // Skip if fixture data not available
      const { tpv, test, scenario } = data;

      const createReport = await mutate(
        gql`
          mutation {
            createTestPlanReport(
              input: {
                testPlanVersionId: ${tpv.id}
                atId: ${scenario.atId}
                minimumAtVersionId: ${atVersionId}
                browserId: ${1}
              }
            ) {
              testPlanReport { id runnableTests { id } }
            }
          }
        `,
        { transaction }
      );
      const testPlanReportId =
        createReport.createTestPlanReport.testPlanReport.id;

      const assign = await mutate(
        gql`
          mutation { testPlanReport(id: ${testPlanReportId}) { assignTester(userId: 1) { testPlanRun { id } } } }
        `,
        { transaction }
      );
      const testPlanRunId = assign.testPlanReport.assignTester.testPlanRun.id;

      const fr = await mutate(
        gql`
          mutation {
            testPlanRun(id: ${testPlanRunId}) {
              findOrCreateTestResult(
                testId: "${test.id}",
                atVersionId: "${atVersionId}",
                browserVersionId: "${browserVersionId}"
              ) {
                testResult {
                  id
                  scenarioResults { id scenario { id } assertionResults { id assertion { id } } }
                }
              }
            }
          }
        `,
        { transaction }
      );
      const { testResult } = fr.testPlanRun.findOrCreateTestResult;
      const sr = testResult.scenarioResults.find(
        s => s.scenario.id === scenario.id
      );

      const dataQuery = await query(
        gql`
          query {
            populateData(locationOfData: { testResultId: "${testResult.id}" }) {
              testResult {
                scenarioResults {
                  id
                  base: assertionResults { assertion { id } }
                  must: assertionResults(priority: MUST) { assertion { id } }
                  should: assertionResults(priority: SHOULD) { assertion { id } }
                  may: assertionResults(priority: MAY) { assertion { id } }
                }
              }
            }
          }
        `,
        { transaction }
      );
      const scenarioEntry =
        dataQuery.populateData.testResult.scenarioResults.find(
          s => s.id === sr.id
        );
      const unionIds = new Set([
        ...scenarioEntry.must.map(x => x.assertion.id),
        ...scenarioEntry.should.map(x => x.assertion.id),
        ...scenarioEntry.may.map(x => x.assertion.id)
      ]);
      const baseIds = new Set(scenarioEntry.base.map(x => x.assertion.id));
      expect(baseIds.size).toBe(unionIds.size);
      for (const id of baseIds) expect(unionIds.has(id)).toBe(true);
    });
  });

  it('matches expected kept assertion counts across sampled v2 tests and scenarios per AT', async () => {
    await dbCleaner(async transaction => {
      const tpvs = await db.TestPlanVersion.findAll({ raw: false });
      const v2Tpvs = tpvs.filter(t => t.metadata?.testFormatVersion === 2);
      const MAX_TPVS = 8;
      const MAX_ATS_PER_TPV = 2;
      const MAX_TESTS_PER_AT = 10;

      let tpvChecked = 0;
      for (const tpv of v2Tpvs) {
        if (tpvChecked >= MAX_TPVS) break;
        const tests = tpv.tests || [];
        const scenariosByAt = new Map();
        for (const test of tests) {
          for (const scenario of test.scenarios || []) {
            const list = scenariosByAt.get(scenario.atId) || [];
            list.push({ test, scenario });
            scenariosByAt.set(scenario.atId, list);
          }
        }

        let atChecked = 0;
        for (const [atId] of scenariosByAt.entries()) {
          if (atChecked >= MAX_ATS_PER_TPV) break;
          const created = await mutate(
            gql`
              mutation {
                createTestPlanReport(
                  input: {
                    testPlanVersionId: ${tpv.id}
                    atId: ${atId}
                    minimumAtVersionId: ${atVersionId}
                    browserId: ${1}
                  }
                ) {
                  testPlanReport { id runnableTests { id } }
                }
              }
            `,
            { transaction }
          );
          const testPlanReportId =
            created.createTestPlanReport.testPlanReport.id;

          const assigned = await mutate(
            gql`
              mutation { testPlanReport(id: ${testPlanReportId}) { assignTester(userId: 1) { testPlanRun { id } } } }
            `,
            { transaction }
          );
          const testPlanRunId =
            assigned.testPlanReport.assignTester.testPlanRun.id;

          const runnableIds =
            created.createTestPlanReport.testPlanReport.runnableTests.map(
              r => r.id
            );
          const testsById = new Map((tpv.tests || []).map(t => [t.id, t]));

          let testsChecked = 0;
          for (const testId of runnableIds) {
            if (testsChecked >= MAX_TESTS_PER_AT) break;
            const t = testsById.get(testId);
            if (!t) continue;

            const fr = await mutate(
              gql`
                mutation {
                  testPlanRun(id: ${testPlanRunId}) {
                    findOrCreateTestResult(
                      testId: "${testId}",
                      atVersionId: "${atVersionId}",
                      browserVersionId: "${browserVersionId}"
                    ) {
                      testResult {
                        id
                      scenarioResults { id scenario { id } assertionResults { id assertion { id } } }
                      }
                    }
                  }
                }
              `,
              { transaction }
            );
            const { testResult } = fr.testPlanRun.findOrCreateTestResult;

            for (const sr of testResult.scenarioResults) {
              const dataQuery = await query(
                gql`
                  query {
                    populateData(locationOfData: { testResultId: "${testResult.id}" }) {
                      testResult {
                        scenarioResults {
                          id
                          base: assertionResults { assertion { id } }
                          must: assertionResults(priority: MUST) { assertion { id } }
                          should: assertionResults(priority: SHOULD) { assertion { id } }
                          may: assertionResults(priority: MAY) { assertion { id } }
                        }
                      }
                    }
                  }
                `,
                { transaction }
              );
              const scenarioEntry =
                dataQuery.populateData.testResult.scenarioResults.find(
                  s => s.id === sr.id
                );
              const unionIds = new Set([
                ...scenarioEntry.must.map(x => x.assertion.id),
                ...scenarioEntry.should.map(x => x.assertion.id),
                ...scenarioEntry.may.map(x => x.assertion.id)
              ]);
              const baseIds = new Set(
                scenarioEntry.base.map(x => x.assertion.id)
              );
              expect(baseIds.size).toBe(unionIds.size);
              for (const id of baseIds) expect(unionIds.has(id)).toBe(true);
            }
            testsChecked += 1;
          }
          atChecked += 1;
        }
        tpvChecked += 1;
      }
    });
  });
});
