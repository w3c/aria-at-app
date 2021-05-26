const { sequelize } = require('../../../models');
const ModelService = require('../../../models/services/ModelService');
const {
    getSequelizeModelAttributes
} = require('../../../models/services/helpers');
const { dbCleaner } = require('../../util/db-cleaner');

// valid ModelService functionality has been covered by all other ModelService tests
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

    it('should return result for raw query', async () => {
        const result = await ModelService.rawQuery(`SELECT * FROM "User"`);

        expect(result).toBeTruthy();
        expect(result.length).toBeGreaterThanOrEqual(1);
    });
});
