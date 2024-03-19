const { sequelize, UserRoles } = require('../../../models');
const ModelService = require('../../../models/services/ModelService');
const {
  getSequelizeModelAttributes,
  USER_ROLES_ATTRIBUTES
} = require('../../../models/services/helpers');
const AtService = require('../../../models/services/AtService');
const BrowserService = require('../../../models/services/BrowserService');
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
      await ModelService.getById(null, { transaction: false });
    };

    await expect(getById()).rejects.toThrow(/not defined/gi);
  });

  it('should throw error if model not passed for getByQuery', async () => {
    const getByQuery = async () => {
      await ModelService.getByQuery(null, { transaction: false });
    };

    await expect(getByQuery()).rejects.toThrow(/not defined/gi);
  });

  it('should throw error if model not passed for get', async () => {
    const get = async () => {
      await ModelService.get(null, { transaction: false });
    };

    await expect(get()).rejects.toThrow(/not defined/gi);
  });

  it('should throw error if model not passed for create', async () => {
    const create = async () => {
      await dbCleaner(async transaction => {
        await ModelService.create(null, { transaction });
      });
    };

    await expect(create()).rejects.toThrow(/not defined/gi);
  });

  it('should throw error if model not passed for update', async () => {
    const update = async () => {
      await dbCleaner(async transaction => {
        await ModelService.update(null, { transaction });
      });
    };

    await expect(update()).rejects.toThrow(/not defined/gi);
  });

  it('should throw error if model not passed for removeById', async () => {
    const removeById = async () => {
      await dbCleaner(async transaction => {
        await ModelService.removeById(null, { transaction });
      });
    };

    await expect(removeById()).rejects.toThrow(/not defined/gi);
  });

  it('should throw error if model not passed for removeByQuery', async () => {
    const removeByQuery = async () => {
      await dbCleaner(async transaction => {
        await ModelService.removeByQuery(null, { transaction });
      });
    };

    await expect(removeByQuery()).rejects.toThrow(/not defined/gi);
  });

  it('should throw error if model not passed for bulkCreate', async () => {
    const bulkCreate = async () => {
      await dbCleaner(async transaction => {
        await ModelService.bulkCreate(null, { transaction });
      });
    };

    await expect(bulkCreate()).rejects.toThrow(/not defined/gi);
  });

  it('should throw error if transaction not passed', async () => {
    const case1 = async () => await ModelService.getById(UserRoles, { id: 1 });

    const case2 = async () =>
      await ModelService.getByQuery(UserRoles, { where: { id: 2 } });

    const case3 = async () =>
      await ModelService.get(UserRoles, {
        where: { id: 2 },
        attributes: USER_ROLES_ATTRIBUTES,
        include: []
      });

    const case4 = async () =>
      await ModelService.create(UserRoles, {
        values: { userId: 1, roleName: 'VENDOR' }
      });

    const case5 = async () =>
      await ModelService.update(UserRoles, {
        where: { userId: 1 },
        values: { roleName: 'TESTER' }
      });

    const case6 = async () =>
      await ModelService.removeById(UserRoles, { id: 1 });

    const case7 = async () =>
      await ModelService.removeByQuery(UserRoles, { where: { id: 1 } });

    const case8 = async () =>
      await ModelService.bulkCreate(UserRoles, {
        valuesList: [
          { userId: 1, roleName: 'ADMIN' },
          { userId: 1, roleName: 'TESTER' },
          { userId: 1, roleName: 'VENDOR' }
        ]
      });

    await expect(case1()).rejects.toThrow(/Please provide a transaction/gi);
    await expect(case2()).rejects.toThrow(/Please provide a transaction/gi);
    await expect(case3()).rejects.toThrow(/Please provide a transaction/gi);
    await expect(case4()).rejects.toThrow(/Please provide a transaction/gi);
    await expect(case5()).rejects.toThrow(/Please provide a transaction/gi);
    await expect(case6()).rejects.toThrow(/Please provide a transaction/gi);
    await expect(case7()).rejects.toThrow(/Please provide a transaction/gi);
    await expect(case8()).rejects.toThrow(/Please provide a transaction/gi);
  });

  it('should support nestedGetOrCreate', async () => {
    await dbCleaner(async transaction => {
      const _atId = 2;
      const _atVersion = '2222.0';
      const _browserId = 1;
      const _browserVersion = '90.0';

      const results = await ModelService.nestedGetOrCreate({
        operations: [
          {
            get: AtService.getAtVersions,
            create: AtService.createAtVersion,
            values: { atId: _atId, name: _atVersion },
            returnAttributes: {}
          },
          {
            get: BrowserService.getBrowserVersions,
            create: BrowserService.createBrowserVersion,
            values: {
              browserId: _browserId,
              name: _browserVersion
            },
            returnAttributes: {}
          }
        ],
        transaction
      });

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
            browserId: _browserId,
            name: _browserVersion
          }),
          true
        ]
      ]);
    });
  });

  it('should support bulkGetOrReplace', async () => {
    await dbCleaner(async transaction => {
      const adminUserId = 1;

      const updatedToAdmin = await ModelService.bulkGetOrReplace(UserRoles, {
        where: { userId: adminUserId },
        valuesList: [{ roleName: 'TESTER' }, { roleName: 'ADMIN' }],
        transaction
      });

      const updatedToTester = await ModelService.bulkGetOrReplace(UserRoles, {
        where: { userId: adminUserId },
        valuesList: [{ roleName: 'TESTER' }],
        transaction
      });

      expect(updatedToAdmin).toBe(false);
      expect(updatedToTester).toBe(true);
    });
  });

  it('should return result for raw query', async () => {
    const result = await ModelService.rawQuery(`SELECT * FROM "User"`, {
      transaction: false
    });

    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});
