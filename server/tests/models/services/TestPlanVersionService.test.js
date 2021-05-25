const { sequelize } = require('../../../models');
const TestPlanVersionService = require('../../../models/services/TestPlanVersionService');
const { dbCleaner } = require('../../util/db-cleaner');
const randomStringGenerator = require('../../util/random-character-generator');

describe('TestPlanReportModel Data Checks', () => {
    afterAll(async () => {
        await sequelize.close();
    });

    it('should return valid testPlanVersion for id query', async () => {
        const _id = 1;

        const testPlanVersion = await TestPlanVersionService.getTestPlanVersionById(
            _id
        );
        const {
            id,
            title,
            status,
            gitSha,
            gitMessage,
            exampleUrl,
            updatedAt,
            parsed,
            testPlanReports
        } = testPlanVersion;

        expect(id).toEqual(_id);
        expect(title).toBeTruthy();
        expect(status).toMatch(/^(DRAFT|IN_REVIEW|FINALIZED)$/);
        expect(gitSha).toBeTruthy();
        expect(gitMessage).toBeTruthy();
        expect(exampleUrl).toBeTruthy();
        expect(updatedAt).toBeTruthy();
        expect(parsed).toBeTruthy();
        expect(testPlanReports).toBeInstanceOf(Array);
        expect(testPlanReports.length).not.toBe(0);
        expect(testPlanReports).toContainEqual(
            expect.objectContaining({ id: expect.any(Number) })
        );
    });

    it('should not be valid testPlanVersion query', async () => {
        const _id = 90210;

        const testPlanVersion = await TestPlanVersionService.getTestPlanVersionById(
            _id
        );

        expect(testPlanVersion).toBeNull();
    });

    it('should create and update testPlanVersion', async () => {
        await dbCleaner(async () => {
            // A1
            const _title = randomStringGenerator();
            const _status = 'DRAFT';
            const _gitSha = randomStringGenerator();
            const _gitMessage = randomStringGenerator();
            const _exampleUrl = randomStringGenerator();
            const _updatedAt = new Date();
            const _parsed = [{ rawMockData: true }];

            const _updatedStatus = 'FINALIZED';

            // A2
            const testPlanVersion = await TestPlanVersionService.createTestPlanVersion(
                {
                    title: _title,
                    status: _status,
                    gitSha: _gitSha,
                    gitMessage: _gitMessage,
                    exampleUrl: _exampleUrl,
                    updatedAt: _updatedAt,
                    parsed: _parsed
                }
            );
            const {
                id: createdId,
                title: createdTitle,
                status: createdStatus,
                gitSha: createdGitSha,
                gitMessage: createdGitMessage,
                exampleUrl: createdExampleUrl,
                updatedAt: createdUpdatedAt,
                parsed: createdParsed
            } = testPlanVersion;

            // A2
            const updatedTestPlanVersion = await TestPlanVersionService.updateTestPlanVersion(
                createdId,
                { status: _updatedStatus }
            );
            const {
                title: updatedTitle,
                status: updatedStatus,
                updatedAt: updatedUpdatedAt
            } = updatedTestPlanVersion;

            // A3
            // After testPlanVersion created
            expect(createdId).toBeTruthy();
            expect(createdTitle).toBe(_title);
            expect(createdStatus).toBe(_status);
            expect(createdGitSha).toBe(_gitSha);
            expect(createdGitMessage).toBe(_gitMessage);
            expect(createdExampleUrl).toBe(_exampleUrl);
            expect(createdUpdatedAt).toEqual(_updatedAt);
            expect(createdParsed).toEqual(_parsed);

            // After updated status
            expect(updatedTitle).toBe(createdTitle);
            expect(updatedStatus).toBe(_updatedStatus);

            // Confirm that updates are not automatically managed - this
            // updatedAt refers to the source code.
            expect(updatedUpdatedAt).toEqual(createdUpdatedAt);
        });
    });

    it('should return collection of testPlanVersions', async () => {
        const result = await TestPlanVersionService.getTestPlanVersions('');
        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should return collection of testPlanVersions for title query', async () => {
        const search = 'checkbo';

        const result = await TestPlanVersionService.getTestPlanVersions(
            search,
            {}
        );

        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    title: expect.stringMatching(/checkbo/gi)
                })
            ])
        );
    });

    it('should return collection of testPlanVersions with paginated structure', async () => {
        const result = await TestPlanVersionService.getTestPlanVersions(
            '',
            {},
            ['id'],
            [],
            [],
            [],
            [],
            {
                page: -1,
                limit: -1,
                enablePagination: true
            }
        );
        expect(result).toHaveProperty('page');
        expect(result).toHaveProperty('data');
        expect(result.data.length).toBeGreaterThanOrEqual(1);
    });
});
