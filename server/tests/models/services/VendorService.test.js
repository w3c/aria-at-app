const { sequelize } = require('../../../models');
const VendorService = require('../../../models/services/VendorService');
const randomStringGenerator = require('../../util/random-character-generator');
const dbCleaner = require('../../util/db-cleaner');

afterAll(async () => {
  await sequelize.close();
});

describe('VendorService', () => {
  it('should create and retrieve a vendor', async () => {
    await dbCleaner(async transaction => {
      const vendorName = randomStringGenerator();

      const createdVendor = await VendorService.createVendor({
        values: { name: vendorName },
        transaction
      });

      expect(createdVendor).toHaveProperty('id');
      expect(createdVendor.name).toBe(vendorName);

      const retrievedVendor = await VendorService.findVendorById({
        id: createdVendor.id,
        transaction
      });

      expect(retrievedVendor).toMatchObject(createdVendor);
    });
  });

  it('should update a vendor', async () => {
    await dbCleaner(async transaction => {
      const vendorName = randomStringGenerator();
      const updatedName = randomStringGenerator();

      const createdVendor = await VendorService.createVendor({
        values: { name: vendorName },
        transaction
      });

      const updatedVendor = await VendorService.updateVendorById({
        id: createdVendor.id,
        values: { name: updatedName },
        transaction
      });

      expect(updatedVendor.name).toBe(updatedName);
    });
  });

  it('should delete a vendor', async () => {
    await dbCleaner(async transaction => {
      const vendorName = randomStringGenerator();

      const createdVendor = await VendorService.createVendor({
        values: { name: vendorName },
        transaction
      });

      await VendorService.removeVendorById({
        id: createdVendor.id,
        transaction
      });

      const deletedVendor = await VendorService.findVendorById({
        id: createdVendor.id,
        transaction
      });

      expect(deletedVendor).toBeNull();
    });
  });
});
