const { sequelize } = require('../../../models');
const TestPlanReportService = require('../../../models/services/TestPlanReportService');

describe('TestPlanReportModel Data Checks', () => {
    afterAll(async () => {
        await sequelize.close();
    });

    it('should return valid testPlanReport for id query with all associations', async () => {
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
        expect(status).toMatch(/^(DRAFT|IN_REVIEW|FINALIZED|REMOVED)$/);
        expect(testPlanTargetId).toBeTruthy();
        expect(testPlanVersionId).toBeTruthy();
        expect(createdAt).toBeTruthy();
        expect(testPlanReport).toHaveProperty('testPlanRuns');
        expect(testPlanReport).toHaveProperty('testPlanVersion');
        expect(testPlanReport).toHaveProperty('testPlanTarget');
    });

    it('should return valid testPlanReport for id query with no associations', async () => {
        const _id = 1;

        const testPlanReport = await TestPlanReportService.getTestPlanReportById(
            _id,
            null,
            [],
            [],
            [],
            []
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
        expect(testPlanReport).not.toHaveProperty('testPlanRuns');
        expect(testPlanReport).not.toHaveProperty('testPlanVersion');
        expect(testPlanReport).not.toHaveProperty('testPlanTarget');
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

    it('should getOrCreate TestPlanReport', () => {
        expect(true).toBe(false);
    });
});
