const { sequelize } = require('../../../models');
const TestPlanRunService = require('../../../models/services/TestPlanRunService');
const { dbCleaner } = require('../../util/db-cleaner');

describe('TestPlanRunModel Data Checks', () => {
    afterAll(async () => {
        await sequelize.close(); // close connection to database
    });

    it('should return valid testPlanRun for id query', async () => {
        const _id = 1;

        const testPlanRun = await TestPlanRunService.getTestPlanRunById(_id);
        const { id, isManuallyTested, tester, testPlanReport } = testPlanRun;

        expect(id).toEqual(_id);
        expect(isManuallyTested).toBeTruthy();
        expect(tester).toBeTruthy();
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

    it('should not create additional testPlanRun if already exists for tester; return testPlanRun if exists', async () => {
        await dbCleaner(async () => {
            const _testPlanReportId = 1;
            const _testerId = 1;

            const testPlanRuns = await TestPlanRunService.getTestPlanRuns('');
            const testPlanRunsLength = testPlanRuns.length;

            const testPlanRun = await TestPlanRunService.createTestPlanRun({
                tester: _testerId,
                testPlanReport: _testPlanReportId
            });
            const newTestPlanRuns = await TestPlanRunService.getTestPlanRuns(
                ''
            );
            const newTestPlanRunsLength = newTestPlanRuns.length;

            expect(testPlanRun).toHaveProperty('id');
            expect(testPlanRun).toHaveProperty('tester');
            expect(testPlanRun).toHaveProperty('testPlanReport');
            expect(testPlanRunsLength).toEqual(newTestPlanRunsLength);
        });
    });

    it('should create testPlanRun if since none exists for tester', async () => {
        await dbCleaner(async () => {
            const _testPlanReportId = 1;
            const _testerId = 2;

            const testPlanRuns = await TestPlanRunService.getTestPlanRuns('');
            const testPlanRunsLength = testPlanRuns.length;

            const testPlanRun = await TestPlanRunService.createTestPlanRun({
                tester: _testerId,
                testPlanReport: _testPlanReportId
            });
            const newTestPlanRuns = await TestPlanRunService.getTestPlanRuns(
                ''
            );
            const newTestPlanRunsLength = newTestPlanRuns.length;

            expect(testPlanRun).toHaveProperty('id');
            expect(testPlanRun).toHaveProperty('tester');
            expect(testPlanRun).toHaveProperty('testPlanReport');
            expect(newTestPlanRunsLength).toBeGreaterThan(testPlanRunsLength);
            expect(newTestPlanRunsLength).toEqual(testPlanRunsLength + 1);
        });
    });

    it('should create and update a new testPlanRun', async () => {
        await dbCleaner(async () => {
            const _testPlanReportId = 1;
            const _testerId = 2;

            const testPlanRun = await TestPlanRunService.createTestPlanRun({
                tester: _testerId,
                testPlanReport: _testPlanReportId
            });

            const {
                id,
                isManuallyTested,
                tester,
                testPlanReport
            } = testPlanRun;

            expect(id).toBeTruthy();
            expect(isManuallyTested).toEqual(false);
            expect(tester).toBeTruthy();
            expect(testPlanReport).toBeTruthy();

            const updatedTestPlanRun = await TestPlanRunService.updateTestPlanRun(
                id,
                { isManuallyTested: true }
            );
            const {
                isManuallyTested: updatedIsManuallyTested,
                tester: updatedTester,
                testPlanReport: updatedTestPlanReport
            } = updatedTestPlanRun;

            expect(updatedIsManuallyTested).toEqual(true);
            expect(updatedTester).toEqual(tester);
            expect(updatedTestPlanReport).toEqual(testPlanReport);
        });
    });

    it('should remove existing testPlanRun', async () => {
        await dbCleaner(async () => {
            const _id = 1;

            const testPlanRun = await TestPlanRunService.getTestPlanRunById(
                _id
            );

            expect(testPlanRun).not.toBeNull();

            await TestPlanRunService.removeTestPlanRun(_id);

            const deletedTestPlanRun = await TestPlanRunService.getTestPlanRunById(
                _id
            );
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
