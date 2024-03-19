const { sequelize } = require('../../../models');
const TestPlanRunService = require('../../../models/services/TestPlanRunService');
const dbCleaner = require('../../util/db-cleaner');

describe('TestPlanRunModel Data Checks', () => {
  afterAll(async () => {
    await sequelize.close();
  });

  it('should return valid testPlanRun for id query with all associations', async () => {
    const _id = 1;

    const testPlanRun = await TestPlanRunService.getTestPlanRunById({
      id: _id,
      transaction: false
    });
    const { id, testerUserId, testPlanReportId, testResults } = testPlanRun;

    expect(id).toEqual(_id);
    expect(testerUserId).toBeTruthy();
    expect(testPlanReportId).toBeTruthy();
    expect(testResults).toBeTruthy();
    expect(testPlanRun).toHaveProperty('testPlanReport');
    expect(testPlanRun).toHaveProperty('tester');
  });

  it('should return valid testPlanRun for id query with no associations', async () => {
    const _id = 1;

    const testPlanRun = await TestPlanRunService.getTestPlanRunById({
      id: _id,
      nestedTestPlanRunAttributes: [],
      testPlanReportAttributes: [],
      testPlanVersionAttributes: [],
      testPlanAttributes: [],
      atAttributes: [],
      userAttributes: [],
      transaction: false
    });
    const { id, testerUserId, testPlanReportId, testResults } = testPlanRun;

    expect(id).toEqual(_id);
    expect(testerUserId).toBeTruthy();
    expect(testPlanReportId).toBeTruthy();
    expect(testResults).toBeTruthy();
    expect(testPlanRun).not.toHaveProperty('testPlanReport');
    expect(testPlanRun).not.toHaveProperty('tester');
  });

  it('should not be valid testPlanRun query', async () => {
    const _id = 53935;

    const user = await TestPlanRunService.getTestPlanRunById({
      id: _id,
      transaction: false
    });

    expect(user).toBeNull();
  });

  it('should contain valid testPlanRun', async () => {
    const _id = 1;

    const testPlanRun = await TestPlanRunService.getTestPlanRunById({
      id: _id,
      transaction: false
    });
    const { testPlanReport } = testPlanRun;

    expect(testPlanReport).toBeTruthy();
    expect(testPlanReport).toHaveProperty('id');
  });

  it('should not create additional testPlanRun if already exists for tester; return testPlanRun if exists instead', async () => {
    await dbCleaner(async transaction => {
      const _testPlanReportId = 1;
      const _testerUserId = 1;

      const testPlanRuns = await TestPlanRunService.getTestPlanRuns({
        transaction
      });
      const testPlanRunsLength = testPlanRuns.length;

      const testPlanRun = await TestPlanRunService.createTestPlanRun({
        values: {
          testerUserId: _testerUserId,
          testPlanReportId: _testPlanReportId
        },
        transaction
      });
      const newTestPlanRuns = await TestPlanRunService.getTestPlanRuns({
        transaction
      });
      const newTestPlanRunsLength = newTestPlanRuns.length;

      expect(testPlanRun).toHaveProperty('id');
      expect(testPlanRun).toHaveProperty('testerUserId');
      expect(testPlanRun).toHaveProperty('testPlanReportId');
      expect(testPlanRunsLength).toEqual(newTestPlanRunsLength);
    });
  });

  it('should create testPlanRun if none exists for tester', async () => {
    await dbCleaner(async transaction => {
      const _testPlanReportId = 1;
      const _testerUserId = 2;

      const testPlanRuns = await TestPlanRunService.getTestPlanRuns({
        transaction
      });
      const testPlanRunsLength = testPlanRuns.length;

      const testPlanRun = await TestPlanRunService.createTestPlanRun({
        values: {
          testerUserId: _testerUserId,
          testPlanReportId: _testPlanReportId
        },
        transaction
      });
      const newTestPlanRuns = await TestPlanRunService.getTestPlanRuns({
        transaction
      });
      const newTestPlanRunsLength = newTestPlanRuns.length;

      expect(testPlanRun).toHaveProperty('id');
      expect(testPlanRun).toHaveProperty('testerUserId');
      expect(testPlanRun).toHaveProperty('testPlanReportId');
      expect(newTestPlanRunsLength).toBeGreaterThan(testPlanRunsLength);
      expect(newTestPlanRunsLength).toEqual(testPlanRunsLength + 1);
    });
  });

  it('should create and update a new testPlanRun', async () => {
    await dbCleaner(async transaction => {
      const _testPlanReportId = 1;
      const _testerUserId = 2;
      const _testResults = [{ test: 'goesHere' }, { test: 'goesHere' }];

      const testPlanRun = await TestPlanRunService.createTestPlanRun({
        values: {
          testerUserId: _testerUserId,
          testPlanReportId: _testPlanReportId,
          testResults: _testResults
        },
        transaction
      });

      const { id, testerUserId, testPlanReportId, testResults } = testPlanRun;

      const updatedTestPlanRun = await TestPlanRunService.updateTestPlanRunById(
        {
          id,
          values: { testResults: [{ test: 'goesHere' }] },
          transaction
        }
      );

      const {
        testerUserId: updatedTesterUserId,
        testPlanReportId: updatedTestPlanReportId,
        testResults: updatedTestResults
      } = updatedTestPlanRun;

      // after testPlanRun created
      expect(id).toBeTruthy();
      expect(testerUserId).toBeTruthy();
      expect(testPlanReportId).toBeTruthy();

      // after testPlanRun updated
      expect(updatedTesterUserId).toEqual(testerUserId);
      expect(updatedTestPlanReportId).toEqual(testPlanReportId);
      expect(updatedTestResults.length).not.toEqual(testResults.length);
    });
  });

  it('should remove existing testPlanRun', async () => {
    await dbCleaner(async transaction => {
      const _id = 1;

      const testPlanRun = await TestPlanRunService.getTestPlanRunById({
        id: _id,
        transaction
      });

      await TestPlanRunService.removeTestPlanRunById({
        id: _id,
        transaction
      });

      const deletedTestPlanRun = await TestPlanRunService.getTestPlanRunById({
        id: _id,
        transaction
      });

      // before testPlanRun removed
      expect(testPlanRun).not.toBeNull();

      // after testPlanRun removed
      expect(deletedTestPlanRun).toBeNull();
    });
  });

  it('should remove existing testPlanRun by query', async () => {
    await dbCleaner(async transaction => {
      const _id = 1;

      const testPlanRun = await TestPlanRunService.getTestPlanRunById({
        id: _id,
        transaction
      });
      const { testerUserId, testPlanReportId } = testPlanRun;

      await TestPlanRunService.removeTestPlanRunByQuery({
        where: { testerUserId, testPlanReportId },
        transaction
      });

      const deletedTestPlanRun = await TestPlanRunService.getTestPlanRunById({
        id: _id,
        transaction
      });

      // before testPlanRun removed
      expect(testPlanRun).not.toBeNull();

      // after testPlanRun removed
      expect(deletedTestPlanRun).toBeNull();
    });
  });

  it('should return collection of testPlanRuns', async () => {
    const result = await TestPlanRunService.getTestPlanRuns({
      transaction: false
    });
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('should return collection of testPlanRuns with paginated structure', async () => {
    const result = await TestPlanRunService.getTestPlanRuns({
      nestedTestPlanRunAttributes: [],
      testPlanReportAttributes: [],
      testPlanVersionAttributes: [],
      testPlanAttributes: [],
      atAttributes: [],
      userAttributes: [],
      pagination: { enablePagination: true },
      transaction: false
    });

    expect(result.data.length).toBeGreaterThanOrEqual(1);
    expect(result).toEqual(
      expect.objectContaining({
        page: 1,
        pageSize: expect.any(Number),
        resultsCount: expect.any(Number),
        totalResultsCount: expect.any(Number),
        pagesCount: expect.any(Number),
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number)
          })
        ])
      })
    );
  });
});
