const { sequelize } = require('../../../models');
const TestPlanReportService = require('../../../models/services/TestPlanReportService');
const dbCleaner = require('../../util/db-cleaner');

describe('TestPlanReportModel Data Checks', () => {
    afterAll(async () => {
        await sequelize.close();
    });

    it('should return valid testPlanReport for id query with all associations', async () => {
        const _id = 1;

        const testPlanReport =
            await TestPlanReportService.getTestPlanReportById(_id);
        const { id, status, testPlanVersionId, createdAt } = testPlanReport;

        expect(id).toEqual(_id);
        expect(status).toMatch(/^(DRAFT|CANDIDATE|RECOMMENDED)$/);
        expect(testPlanVersionId).toBeTruthy();
        expect(createdAt).toBeTruthy();
        expect(testPlanReport).toHaveProperty('testPlanRuns');
        expect(testPlanReport).toHaveProperty('testPlanVersion');
        expect(testPlanReport).toHaveProperty('at');
        expect(testPlanReport).toHaveProperty('browser');
    });

    it('should return valid testPlanReport for id query with no associations', async () => {
        const _id = 1;

        const testPlanReport =
            await TestPlanReportService.getTestPlanReportById(
                _id,
                null,
                [],
                [],
                [],
                [],
                [],
                []
            );
        const { id, status, testPlanVersionId, createdAt, atId, browserId } =
            testPlanReport;

        expect(id).toEqual(_id);
        expect(status).toMatch(/^(DRAFT|CANDIDATE|RECOMMENDED)$/);
        expect(testPlanVersionId).toBeTruthy();
        expect(createdAt).toBeTruthy();
        expect(atId).toBeTruthy();
        expect(browserId).toBeTruthy();
        expect(testPlanReport).not.toHaveProperty('testPlanRuns');
        expect(testPlanReport).not.toHaveProperty('testPlanVersion');
        expect(testPlanReport).not.toHaveProperty('at');
        expect(testPlanReport).not.toHaveProperty('browser');
    });

    it('should not be valid testPlanReport query', async () => {
        const _id = 53935;

        const testPlanReport =
            await TestPlanReportService.getTestPlanReportById(_id);

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

    it('should create TestPlanReport', async () => {
        await dbCleaner(async () => {
            const _atId = 1;
            const _browserId = 1;
            const _testPlanVersionId = 3;
            const _status = 'DRAFT';

            const testPlanReport =
                await TestPlanReportService.createTestPlanReport({
                    status: _status,
                    testPlanVersionId: _testPlanVersionId,
                    atId: _atId,
                    browserId: _browserId
                });

            expect(testPlanReport).toEqual(
                expect.objectContaining({
                    id: expect.anything(),
                    status: _status,
                    testPlanVersion: expect.objectContaining({
                        id: _testPlanVersionId
                    }),
                    at: expect.objectContaining({
                        id: _atId
                    }),
                    browser: expect.objectContaining({
                        id: _browserId
                    })
                })
            );
        });
    });

    it('should getOrCreate TestPlanReport', async () => {
        await dbCleaner(async () => {
            // A1
            const _status = 'DRAFT';
            const _testPlanVersionId = 2;
            const _atId = 2;
            const _browserId = 1;

            // A2
            const [testPlanReport, created] =
                await TestPlanReportService.getOrCreateTestPlanReport({
                    status: _status,
                    testPlanVersionId: _testPlanVersionId,
                    atId: _atId,
                    browserId: _browserId
                });

            // A3
            expect(testPlanReport).toEqual(
                expect.objectContaining({
                    id: expect.anything(),
                    status: _status,
                    testPlanVersion: expect.objectContaining({
                        id: _testPlanVersionId
                    }),
                    at: expect.objectContaining({
                        id: _atId
                    }),
                    browser: expect.objectContaining({
                        id: _browserId
                    })
                })
            );
            expect(created.length).toBe(1);
            expect(created).toEqual(
                expect.arrayContaining([
                    // TestPlanReport
                    expect.objectContaining({
                        testPlanReportId: testPlanReport.id
                    })
                ])
            );
        });
    });
});
