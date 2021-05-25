const { sequelize } = require('../../../models');
const TestPlanRunService = require('../../../models/services/TestPlanRunService');
const { dbCleaner } = require('../../util/db-cleaner');

describe('TestPlanRunModel Data Checks', () => {
    afterAll(async () => {
        await sequelize.close();
    });

    it('should return valid testPlanRun for id query', async () => {
        const _id = 1;

        const testPlanRun = await TestPlanRunService.getTestPlanRunById(_id);
        const {
            id,
            isManuallyTested,
            testerUserId,
            testPlanReport
        } = testPlanRun;

        expect(id).toEqual(_id);
        expect(isManuallyTested).toBeTruthy();
        expect(testerUserId).toBeTruthy();
        expect(testPlanReport).toBeTruthy();
    });

    it('should not be valid testPlanRun query', async () => {
        const _id = 53935;

        const user = await TestPlanRunService.getTestPlanRunById(_id);
        expect(user).toBeNull();
    });

    it('should contain valid testPlanRun with testPlanReportObject', async () => {
        const _id = 1;

        const testPlanRun = await TestPlanRunService.getTestPlanRunById(_id);
        const { testPlanReportObject } = testPlanRun;

        expect(testPlanReportObject).toBeTruthy();
        expect(testPlanReportObject).toHaveProperty('id');
    });

    it('should not create additional testPlanRun if already exists for tester; return testPlanRun if exists instead', async () => {
        await dbCleaner(async () => {
            const _testPlanReportId = 1;
            const _testerUserId = 1;

            const testPlanRuns = await TestPlanRunService.getTestPlanRuns('');
            const testPlanRunsLength = testPlanRuns.length;

            const testPlanRun = await TestPlanRunService.createTestPlanRun({
                testerUserId: _testerUserId,
                testPlanReport: _testPlanReportId
            });
            const newTestPlanRuns = await TestPlanRunService.getTestPlanRuns(
                ''
            );
            const newTestPlanRunsLength = newTestPlanRuns.length;

            expect(testPlanRun).toHaveProperty('id');
            expect(testPlanRun).toHaveProperty('testerUserId');
            expect(testPlanRun).toHaveProperty('testPlanReport');
            expect(testPlanRunsLength).toEqual(newTestPlanRunsLength);
        });
    });

    it('should create testPlanRun if none exists for tester', async () => {
        await dbCleaner(async () => {
            const _testPlanReportId = 1;
            const _testerUserId = 2;

            const testPlanRuns = await TestPlanRunService.getTestPlanRuns('');
            const testPlanRunsLength = testPlanRuns.length;

            const testPlanRun = await TestPlanRunService.createTestPlanRun({
                testerUserId: _testerUserId,
                testPlanReport: _testPlanReportId
            });
            const newTestPlanRuns = await TestPlanRunService.getTestPlanRuns(
                ''
            );
            const newTestPlanRunsLength = newTestPlanRuns.length;

            expect(testPlanRun).toHaveProperty('id');
            expect(testPlanRun).toHaveProperty('testerUserId');
            expect(testPlanRun).toHaveProperty('testPlanReport');
            expect(newTestPlanRunsLength).toBeGreaterThan(testPlanRunsLength);
            expect(newTestPlanRunsLength).toEqual(testPlanRunsLength + 1);
        });
    });

    it('should create and update a new testPlanRun', async () => {
        await dbCleaner(async () => {
            const _testPlanReportId = 1;
            const _testerUserId = 2;

            const testPlanRun = await TestPlanRunService.createTestPlanRun({
                testerUserId: _testerUserId,
                testPlanReport: _testPlanReportId
            });

            const {
                id,
                isManuallyTested,
                testerUserId,
                testPlanReport
            } = testPlanRun;

            const updatedTestPlanRun = await TestPlanRunService.updateTestPlanRun(
                id,
                { isManuallyTested: true }
            );
            const {
                isManuallyTested: updatedIsManuallyTested,
                testerUserId: updatedTesterUserId,
                testPlanReport: updatedTestPlanReport
            } = updatedTestPlanRun;

            // after testPlanRun created
            expect(id).toBeTruthy();
            expect(isManuallyTested).toEqual(false);
            expect(testerUserId).toBeTruthy();
            expect(testPlanReport).toBeTruthy();

            // after testPlanRun updated
            expect(updatedIsManuallyTested).toEqual(true);
            expect(updatedTesterUserId).toEqual(testerUserId);
            expect(updatedTestPlanReport).toEqual(testPlanReport);
        });
    });

    it('should remove existing testPlanRun', async () => {
        await dbCleaner(async () => {
            const _id = 1;

            const testPlanRun = await TestPlanRunService.getTestPlanRunById(
                _id
            );

            await TestPlanRunService.removeTestPlanRun(_id);

            const deletedTestPlanRun = await TestPlanRunService.getTestPlanRunById(
                _id
            );

            // before testPlanRun removed
            expect(testPlanRun).not.toBeNull();

            // after testPlanRun removed
            expect(deletedTestPlanRun).toBeNull();
        });
    });

    it('should return collection of testPlanRuns', async () => {
        const result = await TestPlanRunService.getTestPlanRuns('', {});
        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should return collection of testPlanRuns with paginated structure', async () => {
        const result = await TestPlanRunService.getTestPlanRuns(
            '',
            {},
            ['id'],
            [],
            [],
            [],
            { enablePagination: true }
        );
        expect(result).toHaveProperty('page');
        expect(result).toHaveProperty('data');
        expect(result.data.length).toBeGreaterThanOrEqual(1);
    });
});
