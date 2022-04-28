const { sequelize, UserRoles } = require('../../../models');
const ModelService = require('../../../models/services/ModelService');
const {
    getSequelizeModelAttributes
} = require('../../../models/services/helpers');
const AtService = require('../../../models/services/AtService');
const TestPlanTargetService = require('../../../models/services/TestPlanTargetService');
const dbCleaner = require('../../util/db-cleaner');

// Most valid ModelService functionality has been covered by all other ModelService tests
describe('ModelService', () => {
    afterAll(async () => {
        await sequelize.close();
    });

    it('should throw error if model not passed for getSequelizeModelAttributes', async () => {
        const callGetSequelizeModelAttributes = async () => {
            await getSequelizeModelAttributes(null);
        };

        await expect(callGetSequelizeModelAttributes()).rejects.toThrow(
            /not defined/gi
        );
    });

    it('should throw error if model not passed for getById', async () => {
        const getById = async () => {
            await ModelService.getById(null);
        };

        await expect(getById()).rejects.toThrow(/not defined/gi);
    });

    it('should throw error if model not passed for getByQuery', async () => {
        const getByQuery = async () => {
            await ModelService.getByQuery(null);
        };

        await expect(getByQuery()).rejects.toThrow(/not defined/gi);
    });

    it('should throw error if model not passed for get', async () => {
        const get = async () => {
            await ModelService.get(null);
        };

        await expect(get()).rejects.toThrow(/not defined/gi);
    });

    it('should throw error if model not passed for create', async () => {
        const create = async () => {
            await dbCleaner(async () => {
                await ModelService.create(null);
            });
        };

        await expect(create()).rejects.toThrow(/not defined/gi);
    });

    it('should throw error if model not passed for update', async () => {
        const update = async () => {
            await dbCleaner(async () => {
                await ModelService.update(null);
            });
        };

        await expect(update()).rejects.toThrow(/not defined/gi);
    });

    it('should throw error if model not passed for removeById', async () => {
        const removeById = async () => {
            await dbCleaner(async () => {
                await ModelService.removeById(null);
            });
        };

        await expect(removeById()).rejects.toThrow(/not defined/gi);
    });

    it('should throw error if model not passed for removeByQuery', async () => {
        const removeByQuery = async () => {
            await dbCleaner(async () => {
                await ModelService.removeByQuery(null);
            });
        };

        await expect(removeByQuery()).rejects.toThrow(/not defined/gi);
    });

    it('should throw error if model not passed for bulkCreate', async () => {
        const bulkCreate = async () => {
            await dbCleaner(async () => {
                await ModelService.bulkCreate(null);
            });
        };

        await expect(bulkCreate()).rejects.toThrow(/not defined/gi);
    });

    it('should support nestedGetOrCreate', async () => {
        await dbCleaner(async () => {
            const _atId = 2;
            const _atVersion = '2222.0';
            const _browserId = 1;
            const _browserVersion = '88.0';

            const results = await ModelService.nestedGetOrCreate([
                {
                    get: AtService.getAtVersions,
                    create: AtService.createAtVersion,
                    values: {
                        atId: _atId,
                        name: _atVersion
                    },
                    returnAttributes: [null, []]
                },
                {
                    get: TestPlanTargetService.getTestPlanTargets,
                    create: TestPlanTargetService.createTestPlanTarget,
                    values: {
                        atId: _atId,
                        atVersion: _atVersion,
                        browserId: _browserId,
                        browserVersion: _browserVersion
                    },
                    returnAttributes: [null]
                }
            ]);

            expect(results).toEqual([
                [
                    expect.objectContaining({
                        atId: _atId,
                        name: _atVersion
                    }),
                    true
                ],
                [
                    expect.objectContaining({
                        atId: _atId,
                        atVersion: _atVersion,
                        browserId: _browserId,
                        browserVersion: _browserVersion
                    }),
                    true
                ]
            ]);
        });
    });

    it('should support bulkGetOrReplace', async () => {
        await dbCleaner(async () => {
            const adminUserId = 1;

            const updatedToAdmin = await ModelService.bulkGetOrReplace(
                UserRoles,
                { userId: adminUserId },
                [{ roleName: 'TESTER' }, { roleName: 'ADMIN' }]
            );

            const updatedToTester = await ModelService.bulkGetOrReplace(
                UserRoles,
                { userId: adminUserId },
                [{ roleName: 'TESTER' }]
            );

            expect(updatedToAdmin).toBe(false);
            expect(updatedToTester).toBe(true);
        });
    });

    it('should return result for raw query', async () => {
        const result = await ModelService.rawQuery(`SELECT * FROM "User"`);

        expect(result).toBeTruthy();
        expect(result.length).toBeGreaterThanOrEqual(1);
    });
});
