const { sequelize } = require('../../../models');
const TestPlanService = require('../../../models/services/TestPlanService');
const dbCleaner = require('../../util/db-cleaner');
const randomStringGenerator = require('../../util/random-character-generator');

describe('TestPlanReportModel Data Checks', () => {
    afterAll(async () => {
        await sequelize.close();
    });

    it('should return valid testPlan for id query with all associations', async () => {
        const _id = 1;

        const testPlan = await TestPlanService.getTestPlanById({
            id: _id,
            t: false
        });
        const { id, title, directory } = testPlan;

        expect(id).toEqual(_id);
        expect(title).toBeTruthy();
        expect(directory).toBeTruthy();
        expect(testPlan).toHaveProperty('testPlanVersions');
        expect(testPlan.testPlanVersions[0]).toHaveProperty('testPlanReports');
    });

    it('should return valid testPlan for id query with no associations', async () => {
        const _id = 1;

        const testPlan = await TestPlanService.getTestPlanById({
            id: _id,
            testPlanVersionAttributes: [],
            testPlanReportAttributes: [],
            atAttributes: [],
            browserAttributes: [],
            testPlanRunAttributes: [],
            userAttributes: [],
            t: false
        });
        const { id, title, directory } = testPlan;

        expect(id).toEqual(_id);
        expect(title).toBeTruthy();
        expect(directory).toBeTruthy();
        expect(testPlan).not.toHaveProperty('testPlanVersion');
    });

    it('should not be valid testPlan query', async () => {
        const _id = 90210;

        const testPlan = await TestPlanService.getTestPlanById({
            id: _id,
            t: false
        });

        expect(testPlan).toBeNull();
    });

    it('should create and update testPlan', async () => {
        await dbCleaner(async t => {
            // A1
            const _title = randomStringGenerator();
            const _directory = 'checkbox';

            const _updatedTitle = randomStringGenerator();

            // A2
            const testPlan = await TestPlanService.createTestPlan({
                values: { title: _title, directory: _directory },
                t
            });
            const {
                id: createdId,
                title: createdTitle,
                directory: createdDirectory,
                updatedAt: createdUpdatedAt
            } = testPlan;

            // A2
            const updatedTestPlan = await TestPlanService.updateTestPlanById({
                id: createdId,
                values: { title: _updatedTitle },
                t
            });
            const {
                id: updatedId,
                title: updatedTitle,
                updatedAt: updatedUpdatedAt
            } = updatedTestPlan;

            // A3
            // After testPlan created
            expect(createdId).toBe(updatedId);
            expect(createdTitle).toBe(_title);
            expect(createdDirectory).toBe(_directory);

            // After update
            expect(updatedTitle).toBe(_updatedTitle);

            // Confirm that updates are not automatically managed - this
            // updatedAt refers to the source code.
            expect(updatedUpdatedAt).toEqual(createdUpdatedAt);
        });
    });

    it('should return collection of testPlans', async () => {
        const result = await TestPlanService.getTestPlans({
            t: false
        });
        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should return collection of testPlans for title query', async () => {
        const search = 'checkbo';

        const result = await TestPlanService.getTestPlans({
            search,
            t: false
        });

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

    it('should return collection of testPlans with paginated structure', async () => {
        const result = await TestPlanService.getTestPlans({
            testPlanVersionAttributes: [],
            testPlanReportAttributes: [],
            atAttributes: [],
            browserAttributes: [],
            testPlanRunAttributes: [],
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
});
