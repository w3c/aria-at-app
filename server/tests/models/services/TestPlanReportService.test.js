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
            await TestPlanReportService.getTestPlanReportById({
                id: _id,
                t: false
            });
        const { id, testPlanVersionId, createdAt } = testPlanReport;

        expect(id).toEqual(_id);
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
            await TestPlanReportService.getTestPlanReportById({
                id: _id,
                testPlanRunAttributes: [],
                testPlanVersionAttributes: [],
                testPlanAttributes: [],
                atAttributes: [],
                browserAttributes: [],
                userAttributes: [],
                t: false
            });

        const { id, testPlanVersionId, createdAt, atId, browserId } =
            testPlanReport;

        expect(id).toEqual(_id);
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
            await TestPlanReportService.getTestPlanReportById({
                id: _id,
                t: false
            });

        expect(testPlanReport).toBeNull();
    });

    it('should return collection of testPlanReports', async () => {
        const result = await TestPlanReportService.getTestPlanReports({
            t: false
        });
        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should return collection of testPlanReports with paginated structure', async () => {
        const result = await TestPlanReportService.getTestPlanReports({
            testPlanRunAttributes: [],
            testPlanVersionAttributes: [],
            testPlanAttributes: [],
            atAttributes: [],
            browserAttributes: [],
            userAttributes: [],
            pagination: { enablePagination: true },
            t: false
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

    it('should create TestPlanReport', async () => {
        await dbCleaner(async t => {
            const _atId = 1;
            const _browserId = 1;
            const _testPlanVersionId = 3;

            const testPlanReport =
                await TestPlanReportService.createTestPlanReport({
                    values: {
                        testPlanVersionId: _testPlanVersionId,
                        atId: _atId,
                        browserId: _browserId
                    },
                    t
                });

            expect(testPlanReport).toEqual(
                expect.objectContaining({
                    id: expect.anything(),
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
        await dbCleaner(async t => {
            // A1
            const _testPlanVersionId = 2;
            const _atId = 2;
            const _browserId = 1;

            // A2
            const [testPlanReport, created] =
                await TestPlanReportService.getOrCreateTestPlanReport({
                    where: {
                        testPlanVersionId: _testPlanVersionId,
                        atId: _atId,
                        browserId: _browserId
                    },
                    t
                });

            // A3
            expect(testPlanReport).toEqual(
                expect.objectContaining({
                    id: expect.anything(),
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
