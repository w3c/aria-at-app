const { sequelize } = require('../../../models');
const TestPlanTargetService = require('../../../models/services/TestPlanTargetService');
const randomStringGenerator = require('../../util/random-character-generator');
const { dbCleaner } = require('../../util/db-cleaner');

describe('TestPlanTargetModel data Checks', () => {
    afterAll(async () => {
        await sequelize.close();
    });

    it('should return valid testPlanTarget for id query', async () => {
        const _id = 1;

        const testPlanTarget = await TestPlanTargetService.getTestPlanTargetById(
            _id
        );
        const {
            id,
            title,
            atId,
            browserId,
            atVersion,
            browserVersion
        } = testPlanTarget;

        expect(id).toEqual(_id);
        expect(title).toEqual('NVDA 2020.4 with Chrome 91.0.4472');
        expect(atId).toBeTruthy();
        expect(atVersion).toBeTruthy();
        expect(browserId).toBeTruthy();
        expect(browserVersion).toBeTruthy();
    });

    it('should not be valid testPlanTarget query', async () => {
        const _id = 53935;

        const user = await TestPlanTargetService.getTestPlanTargetById(_id);
        expect(user).toBeNull();
    });

    it('should create a new testPlanTarget with a constructed title', async () => {
        await dbCleaner(async () => {
            // A1
            const _title = null;
            const _atId = 2;
            const _browserId = 2;
            const _atVersion = '2020.4';
            const _browserVersion = '91.0.4472';
            const constructedTitle = `NVDA ${_atVersion} with Chrome ${_browserVersion}`;

            // A2
            const testPlanTarget = await TestPlanTargetService.createTestPlanTarget(
                {
                    title: _title,
                    atId: _atId,
                    browserId: _browserId,
                    atVersion: _atVersion,
                    browserVersion: _browserVersion
                }
            );
            const {
                id,
                title,
                atId,
                browserId,
                atVersion,
                browserVersion
            } = testPlanTarget;

            // A3
            expect(id).toBeTruthy();
            expect(title).toEqual(constructedTitle);
            expect(atId).toEqual(2);
            expect(browserId).toEqual(2);
            expect(atVersion).toEqual(_atVersion);
            expect(browserVersion).toEqual(_browserVersion);
        });
    });

    it('should fail to create a new testPlanTarget with invalid at or browser string entries', async () => {
        await dbCleaner(async () => {
            // A1
            const _title = null;
            const _atId = 22;
            const _browserId = 22;
            const _atVersion = '2020.4';
            const _browserVersion = '91.0.4472';

            // A2
            const createTestPlanTarget = async () => {
                await TestPlanTargetService.createTestPlanTarget({
                    title: _title,
                    atId: _atId,
                    browserId: _browserId,
                    atVersion: _atVersion,
                    browserVersion: _browserVersion
                });
            };

            await expect(createTestPlanTarget()).rejects.toThrow(
                /violates foreign key/gi
            );
        });
    });

    it('should fail to create a new testPlanTarget with invalid at or browser number entries', async () => {
        await dbCleaner(async () => {
            // A1
            const _title = null;
            const _atId = 594;
            const _browserId = 242;
            const _atVersion = '2020.4';
            const _browserVersion = '91.0.4472';

            // A2
            const createTestPlanTarget = async () => {
                await TestPlanTargetService.createTestPlanTarget({
                    title: _title,
                    atId: _atId,
                    browserId: _browserId,
                    atVersion: _atVersion,
                    browserVersion: _browserVersion
                });
            };

            await expect(createTestPlanTarget()).rejects.toThrow(
                /violates foreign key/gi
            );
        });
    });

    it('should create and remove a new testPlanTarget', async () => {
        await dbCleaner(async () => {
            // A1
            const _title = randomStringGenerator();
            const _atId = 2;
            const _browserId = 2;
            const _atVersion = '2020.4';
            const _browserVersion = '91.0.4472';

            // A2
            const testPlanTarget = await TestPlanTargetService.createTestPlanTarget(
                {
                    title: _title,
                    atId: _atId,
                    browserId: _browserId,
                    atVersion: _atVersion,
                    browserVersion: _browserVersion
                }
            );
            const {
                id,
                title,
                atId,
                browserId,
                atVersion,
                browserVersion
            } = testPlanTarget;

            // A2
            await TestPlanTargetService.removeTestPlanTarget(id);
            const deletedTestPlanTarget = await TestPlanTargetService.getTestPlanTargetById(
                id
            );

            // after testPlanTarget created
            expect(id).toBeTruthy();
            expect(title).toEqual(_title);
            expect(atId).toEqual(_atId);
            expect(browserId).toEqual(_browserId);
            expect(atVersion).toEqual(_atVersion);
            expect(browserVersion).toEqual(_browserVersion);

            // after testPlanTarget removed
            expect(deletedTestPlanTarget).toBeNull();
        });
    });

    it('should return collection of testPlanTargets', async () => {
        const result = await TestPlanTargetService.getTestPlanTargets('', {});
        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should return collection of testPlanTargets for title query', async () => {
        const search = 'Chrome';

        const result = await TestPlanTargetService.getTestPlanTargets(search);

        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    title: expect.stringMatching(/Chrome/gi),
                    atId: expect.any(Number),
                    browserId: expect.any(Number),
                    atVersion: expect.any(String),
                    browserVersion: expect.any(String)
                })
            ])
        );
    });

    it('should return collection of testPlanTargets with paginated structure', async () => {
        const result = await TestPlanTargetService.getTestPlanTargets(
            '',
            {},
            ['id'],
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
});
