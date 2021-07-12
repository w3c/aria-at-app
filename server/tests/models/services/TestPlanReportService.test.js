const { sequelize } = require('../../../models');
const TestPlanReportService = require('../../../models/services/TestPlanReportService');
const dbCleaner = require('../../util/db-cleaner');

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
            const _testPlanTargetId = 1;
            const _testPlanVersionId = 3;
            const _status = 'DRAFT';

            const testPlanReport = await TestPlanReportService.createTestPlanReport(
                {
                    status: _status,
                    testPlanTargetId: _testPlanTargetId,
                    testPlanVersionId: _testPlanVersionId
                }
            );

            expect(testPlanReport).toEqual(
                expect.objectContaining({
                    id: expect.anything(),
                    status: _status,
                    testPlanVersion: expect.objectContaining({
                        id: _testPlanVersionId
                    }),
                    testPlanTarget: expect.objectContaining({
                        id: _testPlanTargetId
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
            const _atVersion = '2020.4';
            const _browserId = 1;
            const _browserVersion = '86.0.1';
            const _testPlanTarget = {
                atId: _atId,
                atVersion: _atVersion,
                browserId: _browserId,
                browserVersion: _browserVersion
            };

            // A2
            const [
                testPlanReport,
                created
            ] = await TestPlanReportService.getOrCreateTestPlanReport({
                status: _status,
                testPlanVersionId: _testPlanVersionId,
                testPlanTarget: _testPlanTarget
            });

            // A3
            expect(testPlanReport).toEqual(
                expect.objectContaining({
                    id: expect.anything(),
                    status: _status,
                    testPlanVersion: expect.objectContaining({
                        id: _testPlanVersionId
                    }),
                    testPlanTarget: expect.objectContaining({
                        atId: _atId,
                        atVersion: _atVersion,
                        browserId: _browserId,
                        browserVersion: _browserVersion
                    })
                })
            );
            expect(created.length).toBe(2);
            expect(created).toEqual(
                expect.arrayContaining([
                    // TestPlanReport
                    expect.objectContaining({
                        testPlanReportId: testPlanReport.id
                    }),
                    // TestPlanTarget
                    expect.objectContaining({
                        testPlanReportId: testPlanReport.id,
                        testPlanTargetId: expect.anything()
                    })
                ])
            );
        });
    });
});
