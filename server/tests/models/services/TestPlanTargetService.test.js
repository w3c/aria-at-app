const { sequelize } = require('../../../models');
const TestPlanTargetService = require('../../../models/services/TestPlanTargetService');
const randomStringGenerator = require('../../util/random-character-generator');
const { dbCleaner } = require('../../util/db-cleaner');

describe('TestPlanTargetModel data Checks', () => {
    afterAll(async () => {
        await sequelize.close(); // close connection to database
    });

    it('should return valid testPlanTarget for id query', async () => {
        const _id = 1;

        const testPlanTarget = await TestPlanTargetService.getTestPlanTargetById(
            _id
        );
        const {
            id,
            title,
            at,
            browser,
            atVersion,
            browserVersion
        } = testPlanTarget;

        expect(id).toEqual(_id);
        expect(title).toEqual('NVDA 2020.4 with Chrome 91.0.4472');
        expect(at).toBeTruthy();
        expect(atVersion).toBeTruthy();
        expect(browser).toBeTruthy();
        expect(browserVersion).toBeTruthy();
    });

    it('should not be valid testPlanTarget query', async () => {
        const _id = 53935;

        const user = await TestPlanTargetService.getTestPlanTargetById(_id);
        expect(user).toBeNull();
    });

    it('should create and remove a new testPlanTarget', async () => {
        await dbCleaner(async () => {
            // A1
            const _title = randomStringGenerator();
            const _at = 2;
            const _browser = 2;
            const _atVersion = '2020.4';
            const _browserVersion = '91.0.4472';

            // A2
            const testPlanTarget = await TestPlanTargetService.createTestPlanTarget(
                {
                    title: _title,
                    at: _at,
                    browser: _browser,
                    atVersion: _atVersion,
                    browserVersion: _browserVersion
                }
            );
            const {
                id,
                title,
                at,
                browser,
                atVersion,
                browserVersion
            } = testPlanTarget;

            // A3
            expect(id).toBeTruthy();
            expect(title).toEqual(_title);
            expect(at).toEqual(_at);
            expect(browser).toEqual(_browser);
            expect(atVersion).toEqual(_atVersion);
            expect(browserVersion).toEqual(_browserVersion);

            // A2
            await TestPlanTargetService.removeTestPlanTarget(id);
            const deletedTestPlanTarget = await TestPlanTargetService.getTestPlanTargetById(
                id
            );

            // A3
            expect(deletedTestPlanTarget).toBeNull();
        });
    });

    it('should return collection of testPlanTargets', async () => {
        const result = await TestPlanTargetService.getTestPlanTargets('', {});
        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should return collection of testPlanTargets for title query', async () => {
        const search = 'Chrome';

        const result = await TestPlanTargetService.getTestPlanTargets(
            search,
            {}
        );
        const result0thIndex = result[0];

        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result0thIndex).toHaveProperty('id');
        expect(result0thIndex).toHaveProperty('title');
        expect(result0thIndex.title).toMatch(/Chrome/gi);
    });

    it('should return collection of testPlanTargets with paginated structure', async () => {
        const result = await TestPlanTargetService.getTestPlanTargets(
            '',
            {},
            ['title'],
            { enablePagination: true }
        );
        expect(result).toHaveProperty('page');
        expect(result).toHaveProperty('data');
        expect(result.data.length).toBeGreaterThanOrEqual(1);
    });
});
