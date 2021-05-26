const { sequelize } = require('../../../models');
const TestPlanReportService = require('../../../models/services/TestPlanReportService');

describe('TestPlanReportModel Data Checks', () => {
    afterAll(async () => {
        await sequelize.close();
    });

    it('should return valid testPlanReport for id query', async () => {
        const _id = 1;

        const testPlanReport = await TestPlanReportService.getTestPlanReportById(
            _id
        );
        const {
            id,
            status,
            testPlanTargetId,
            testPlanVersionId,
            createdAt
        } = testPlanReport;

        expect(id).toEqual(_id);
        expect(status).toMatch(/^(DRAFT|IN_REVIEW|FINALIZED)$/);
        expect(testPlanTargetId).toBeTruthy();
        expect(testPlanVersionId).toBeTruthy();
        expect(createdAt).toBeTruthy();
    });

    it('should not be valid testPlanReport query', async () => {
        const _id = 53935;

        const testPlanReport = await TestPlanReportService.getTestPlanReportById(
            _id
        );

        expect(testPlanReport).toBeNull();
    });

    it('should return collection of testPlanReports', async () => {
        const result = await TestPlanReportService.getTestPlanReports('');
        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should return collection of testPlanReports with paginated structure', async () => {
        const result = await TestPlanReportService.getTestPlanReports(
            '',
            {},
            ['id'],
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
