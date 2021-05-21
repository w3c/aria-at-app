const { sequelize } = require('../../../models');
const TestPlanReportService = require('../../../models/services/TestPlanReportService');
const UserService = require('../../../models/services/UserService');
const { dbCleaner } = require('../../util/db-cleaner');

describe('TestPlanReportModel Data Checks', () => {
    afterAll(async () => {
        await sequelize.close(); // close connection to database
    });

    it('should return valid testPlanReport for id query', async () => {
        const _id = 1;

        const testPlanReport = await TestPlanReportService.getTestPlanReportById(
            _id
        );
        const {
            id,
            publishStatus,
            testPlanTarget,
            testPlan,
            coveragePercent,
            createdAt
        } = testPlanReport;

        expect(id).toEqual(_id);
        expect(publishStatus).toMatch(/(draft)|(in_review)|(final)/gi);
        expect(testPlanTarget).toBeTruthy();
        expect(testPlan).toBeTruthy();
        expect(coveragePercent).toBeTruthy();
        expect(createdAt).toBeTruthy();
    });

    it('should not be valid testPlanReport query', async () => {
        const _id = 53935;

        const user = await TestPlanReportService.getTestPlanReportById(_id);
        expect(user).toBeNull();
    });

    it('should update testPlanReport status to final', async () => {
        await dbCleaner(async () => {
            const _id = 1;
            const _status = 'final';

            const testPlanReport = await TestPlanReportService.getTestPlanReportById(
                _id
            );
            const { id, publishStatus } = testPlanReport;

            expect(id).toEqual(_id);
            expect(publishStatus).toMatch(/(draft)|(in_review)/gi);

            const updatedTestPlanReport = await TestPlanReportService.updateTestPlanReportStatus(
                _id,
                _status
            );

            const {
                id: updatedId,
                publishStatus: updatedPublishStatus
            } = updatedTestPlanReport;

            expect(updatedId).toEqual(_id);
            expect(updatedPublishStatus).toEqual(_status);
            expect(updatedPublishStatus).not.toEqual(publishStatus);
        });
    });

    it('should assign testPlanReport to tester and remove testPlanReport from tester', async () => {
        await dbCleaner(async () => {
            const _id = 1;
            const _userId = 2;

            const testPlanReport = await TestPlanReportService.assignTestPlanReportToUser(
                _id,
                _userId
            );
            const { id } = testPlanReport;

            const user = await UserService.getUserById(_userId);
            const { id: userId, testPlanRuns } = user;

            const testPlanRunsLength = testPlanRuns.length;

            expect(id).toEqual(_id);
            expect(userId).toEqual(_userId);
            expect(testPlanRuns).toBeTruthy();
            expect(testPlanRunsLength).toBeGreaterThanOrEqual(1);
            expect(testPlanRuns).toContainEqual(
                expect.objectContaining({ tester: userId, testPlanReport: _id })
            );

            const removedTesterTestPlanReport = await TestPlanReportService.removeTestPlanReportForUser(
                _id,
                _userId
            );
            const {
                id: removedTesterTestPlanReportId
            } = removedTesterTestPlanReport;

            const removedUser = await UserService.getUserById(_userId);
            const {
                id: removedUserId,
                testPlanRuns: removedTestPlanRuns
            } = removedUser;

            expect(removedTesterTestPlanReportId).toEqual(_id);
            expect(removedUserId).toEqual(_userId);
            expect(removedTestPlanRuns).toBeTruthy();
            expect(removedTestPlanRuns.length).toEqual(testPlanRunsLength - 1);
            expect(removedTestPlanRuns).not.toContainEqual(
                expect.objectContaining({
                    tester: removedUserId,
                    testPlanReport: _id
                })
            );
        });
    });

    it('should return collection of testPlanReports', async () => {
        const result = await TestPlanReportService.getTestPlanReports('', {});
        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should return collection of testPlanReports with paginated structure', async () => {
        const result = await TestPlanReportService.getTestPlanReports(
            '',
            {},
            ['publishStatus'],
            [],
            [],
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
