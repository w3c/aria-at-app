const { sequelize } = require('../../../models');
const NegativeSideEffectService = require('../../../models/services/NegativeSideEffectService');
const dbCleaner = require('../../util/db-cleaner');

describe('NegativeSideEffectService Data Checks', () => {
  afterAll(async () => {
    await sequelize.close();
  });

  describe('createNegativeSideEffect', () => {
    it('should create a negative side effect', async () => {
      await dbCleaner(async transaction => {
        // Create a test plan run first
        const testPlanRun = await sequelize.models.TestPlanRun.create(
          {
            testerUserId: 1,
            testPlanReportId: 1,
            testResults: [],
            initiatedByAutomation: false,
            isRerun: false
          },
          { transaction }
        );

        const negativeSideEffectData = {
          testPlanRunId: testPlanRun.id,
          testResultId: 'test-result-123',
          scenarioResultId: 'scenario-result-456',
          negativeSideEffectId: 'EXCESSIVELY_VERBOSE',
          impact: 'MODERATE',
          details: 'Test details',
          highlightRequired: false,
          encodedId: `${testPlanRun.id}-test-result-123-scenario-result-456-EXCESSIVELY_VERBOSE`
        };

        const created =
          await NegativeSideEffectService.createNegativeSideEffect({
            values: negativeSideEffectData,
            transaction
          });

        expect(created).toBeDefined();
        expect(created.id).toBeDefined();
        expect(created.testPlanRunId).toBe(testPlanRun.id);
        expect(created.testResultId).toBe('test-result-123');
        expect(created.scenarioResultId).toBe('scenario-result-456');
        expect(created.negativeSideEffectId).toBe('EXCESSIVELY_VERBOSE');
        expect(created.impact).toBe('MODERATE');
        expect(created.details).toBe('Test details');
        expect(created.highlightRequired).toBe(false);
      });
    });
  });

  describe('getNegativeSideEffectById', () => {
    it('should retrieve a negative side effect by ID', async () => {
      await dbCleaner(async transaction => {
        // Create a test plan run first
        const testPlanRun = await sequelize.models.TestPlanRun.create(
          {
            testerUserId: 1,
            testPlanReportId: 1,
            testResults: [],
            initiatedByAutomation: false,
            isRerun: false
          },
          { transaction }
        );

        const negativeSideEffectData = {
          testPlanRunId: testPlanRun.id,
          testResultId: 'test-result-123',
          scenarioResultId: 'scenario-result-456',
          negativeSideEffectId: 'EXCESSIVELY_VERBOSE',
          impact: 'MODERATE',
          details: 'Test details',
          highlightRequired: false,
          encodedId: `${testPlanRun.id}-test-result-123-scenario-result-456-EXCESSIVELY_VERBOSE`
        };

        const created =
          await NegativeSideEffectService.createNegativeSideEffect({
            values: negativeSideEffectData,
            transaction
          });

        const retrieved =
          await NegativeSideEffectService.getNegativeSideEffectById({
            id: created.id,
            transaction
          });

        expect(retrieved).toBeDefined();
        expect(retrieved.id).toBe(created.id);
        expect(retrieved.testPlanRunId).toBe(testPlanRun.id);
        expect(retrieved.negativeSideEffectId).toBe('EXCESSIVELY_VERBOSE');
      });
    });
  });

  describe('getNegativeSideEffectsByTestPlanRunId', () => {
    it('should retrieve negative side effects by test plan run ID', async () => {
      await dbCleaner(async transaction => {
        // Create a test plan run first
        const testPlanRun = await sequelize.models.TestPlanRun.create(
          {
            testerUserId: 1,
            testPlanReportId: 1,
            testResults: [],
            initiatedByAutomation: false,
            isRerun: false
          },
          { transaction }
        );

        const negativeSideEffectsData = [
          {
            testPlanRunId: testPlanRun.id,
            testResultId: 'test-result-123',
            scenarioResultId: 'scenario-result-456',
            negativeSideEffectId: 'EXCESSIVELY_VERBOSE',
            impact: 'MODERATE',
            details: 'Test details 1',
            highlightRequired: false,
            encodedId: `${testPlanRun.id}-test-result-123-scenario-result-456-EXCESSIVELY_VERBOSE`
          },
          {
            testPlanRunId: testPlanRun.id,
            testResultId: 'test-result-789',
            scenarioResultId: 'scenario-result-012',
            negativeSideEffectId: 'SLUGGISH',
            impact: 'SEVERE',
            details: 'Test details 2',
            highlightRequired: true,
            encodedId: `${testPlanRun.id}-test-result-789-scenario-result-012-SLUGGISH`
          }
        ];

        await NegativeSideEffectService.bulkCreateNegativeSideEffects({
          negativeSideEffectsData,
          transaction
        });

        const retrieved =
          await NegativeSideEffectService.getNegativeSideEffectsByTestPlanRunId(
            {
              testPlanRunId: testPlanRun.id,
              transaction
            }
          );

        expect(retrieved).toHaveLength(2);
        expect(retrieved[0].testPlanRunId).toBe(testPlanRun.id);
        expect(retrieved[1].testPlanRunId).toBe(testPlanRun.id);
      });
    });
  });

  describe('linkAtBugsToNegativeSideEffect', () => {
    it('should link AtBugs to a negative side effect', async () => {
      await dbCleaner(async transaction => {
        // Create a test plan run first
        const testPlanRun = await sequelize.models.TestPlanRun.create(
          {
            testerUserId: 1,
            testPlanReportId: 1,
            testResults: [],
            initiatedByAutomation: false,
            isRerun: false
          },
          { transaction }
        );

        // Use existing AT (JAWS with id 1)
        const atId = 1;

        // Create an AtBug
        const atBug = await sequelize.models.AtBug.create(
          {
            title: 'Test Bug',
            bugId: '123',
            url: 'https://example.com/bug/123',
            atId: atId
          },
          { transaction }
        );

        const negativeSideEffectData = {
          testPlanRunId: testPlanRun.id,
          testResultId: 'test-result-123',
          scenarioResultId: 'scenario-result-456',
          negativeSideEffectId: 'EXCESSIVELY_VERBOSE',
          impact: 'MODERATE',
          details: 'Test details',
          highlightRequired: false,
          encodedId: `${testPlanRun.id}-test-result-123-scenario-result-456-EXCESSIVELY_VERBOSE`
        };

        const created =
          await NegativeSideEffectService.createNegativeSideEffect({
            values: negativeSideEffectData,
            transaction
          });

        const linked =
          await NegativeSideEffectService.linkAtBugsToNegativeSideEffect({
            negativeSideEffectId: created.id,
            atBugIds: [atBug.id],
            transaction
          });

        expect(linked.atBugs).toEqual(
          expect.arrayContaining([expect.objectContaining({ id: atBug.id })])
        );

        const unlinked =
          await NegativeSideEffectService.unlinkAtBugsFromNegativeSideEffect({
            negativeSideEffectId: created.id,
            atBugIds: [atBug.id],
            transaction
          });

        expect(unlinked.atBugs).toEqual([]);
      });
    });
  });

  describe('bulkCreateNegativeSideEffects', () => {
    it('should create multiple negative side effects efficiently', async () => {
      await dbCleaner(async transaction => {
        // Create a test plan run first
        const testPlanRun = await sequelize.models.TestPlanRun.create(
          {
            testerUserId: 1,
            testPlanReportId: 1,
            testResults: [],
            initiatedByAutomation: false,
            isRerun: false
          },
          { transaction }
        );

        const negativeSideEffectsData = Array.from({ length: 10 }, (_, i) => ({
          testPlanRunId: testPlanRun.id,
          testResultId: `test-result-${i}`,
          scenarioResultId: `scenario-result-${i}`,
          negativeSideEffectId: 'EXCESSIVELY_VERBOSE',
          impact: 'MODERATE',
          details: `Test details ${i}`,
          highlightRequired: false,
          encodedId: `${testPlanRun.id}-test-result-${i}-scenario-result-${i}-EXCESSIVELY_VERBOSE`
        }));

        const created =
          await NegativeSideEffectService.bulkCreateNegativeSideEffects({
            negativeSideEffectsData,
            transaction
          });

        expect(created).toHaveLength(10);
        expect(created[0].testPlanRunId).toBe(testPlanRun.id);
        expect(created[9].testPlanRunId).toBe(testPlanRun.id);
      });
    });
  });
});
