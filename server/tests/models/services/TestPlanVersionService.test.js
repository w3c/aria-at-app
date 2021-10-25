const { sequelize } = require('../../../models');
const TestPlanVersionService = require('../../../models/services/TestPlanVersionService');
const dbCleaner = require('../../util/db-cleaner');
const randomStringGenerator = require('../../util/random-character-generator');

describe('TestPlanReportModel Data Checks', () => {
    afterAll(async () => {
        await sequelize.close();
    });

    it('should return valid testPlanVersion for id query with all associations', async () => {
        const _id = 1;

        const testPlanVersion = await TestPlanVersionService.getTestPlanVersionById(
            _id
        );
        const {
            id,
            title,
            directory,
            gitSha,
            gitMessage,
            updatedAt,
            metadata,
            tests,
            testPlanReports
        } = testPlanVersion;

        expect(id).toEqual(_id);
        expect(title).toBeTruthy();
        expect(directory).toBeTruthy();
        expect(gitSha).toBeTruthy();
        expect(gitMessage).toBeTruthy();
        expect(updatedAt).toBeTruthy();
        expect(metadata).toBeTruthy();
        expect(tests).toBeTruthy();
        expect(testPlanReports).toBeInstanceOf(Array);
        expect(testPlanVersion).toHaveProperty('testPlanReports');
    });

    it('should return valid testPlanVersion for id query with no associations', async () => {
        const _id = 1;

        const testPlanVersion = await TestPlanVersionService.getTestPlanVersionById(
            _id,
            null,
            [],
            [],
            [],
            []
        );
        const {
            id,
            title,
            directory,
            gitSha,
            gitMessage,
            updatedAt,
            metadata,
            tests
        } = testPlanVersion;

        expect(id).toEqual(_id);
        expect(title).toBeTruthy();
        expect(directory).toBeTruthy();
        expect(gitSha).toBeTruthy();
        expect(gitMessage).toBeTruthy();
        expect(updatedAt).toBeTruthy();
        expect(metadata).toBeTruthy();
        expect(tests).toBeTruthy();
        expect(testPlanVersion).not.toHaveProperty('testPlanReports');
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
            const _id = 99;
            const _title = randomStringGenerator();
            const _directory = 'checkbox';
            const _gitSha = randomStringGenerator();
            const _gitMessage = randomStringGenerator();
            const _testPageUrl = randomStringGenerator();
            const _updatedAt = new Date();
            const _metadata = { designPattern: 'https://google.com' };
            const _tests = [{ test: 'goes here' }];

            const _updatedTitle = randomStringGenerator();

            // A2
            const testPlanVersion = await TestPlanVersionService.createTestPlanVersion(
                {
                    id: _id,
                    title: _title,
                    directory: _directory,
                    gitSha: _gitSha,
                    gitMessage: _gitMessage,
                    testPageUrl: _testPageUrl,
                    updatedAt: _updatedAt,
                    metadata: _metadata,
                    tests: _tests
                }
            );
            const {
                id: createdId,
                title: createdTitle,
                directory: createdDirectory,
                gitSha: createdGitSha,
                gitMessage: createdGitMessage,
                testPageUrl: createdTestPageUrl,
                updatedAt: createdUpdatedAt,
                metadata: createdMetadata,
                tests: createdTests
            } = testPlanVersion;

            // A2
            const updatedTestPlanVersion = await TestPlanVersionService.updateTestPlanVersion(
                createdId,
                { title: _updatedTitle }
            );
            const {
                title: updatedTitle,
                updatedAt: updatedUpdatedAt
            } = updatedTestPlanVersion;

            // A3
            // After testPlanVersion created
            expect(createdId).toBe(_id);
            expect(createdTitle).toBe(_title);
            expect(createdDirectory).toBe(_directory);
            expect(createdGitSha).toBe(_gitSha);
            expect(createdGitMessage).toBe(_gitMessage);
            expect(createdTestPageUrl).toBe(_testPageUrl);
            expect(createdUpdatedAt).toEqual(_updatedAt);
            expect(createdMetadata).toEqual(_metadata);
            expect(createdTests).toEqual(_tests);

            // After update
            expect(updatedTitle).toBe(_updatedTitle);

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
                enablePagination: true
            }
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
});
