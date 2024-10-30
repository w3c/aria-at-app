'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async transaction => {
      // Create NVDA vendor and retrieve id to use with 'At' table
      const [vendor] = await queryInterface.sequelize.query(
        `insert into "Vendor" (name, "createdAt", "updatedAt")
         values ('nvAccess', now(), now())
         returning id`,
        {
          type: Sequelize.QueryTypes.INSERT,
          transaction
        }
      );

      // Update NVDA's vendorId column value
      const nvAccessVendorId = vendor[0].id;
      await queryInterface.sequelize.query(
        `update "At"
         set "vendorId" = :vendorId
         where "name" = 'NVDA'`,
        {
          replacements: { vendorId: nvAccessVendorId },
          transaction
        }
      );
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async transaction => {
      // Get the vendor id for NVDA to use to remove from the 'At' table
      const [vendor] = await queryInterface.sequelize.query(
        `select id
         from "Vendor"
         where name = 'nvAccess'
         limit 1`,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      if (vendor) {
        const nvAccessVendorId = vendor.id;
        await queryInterface.sequelize.query(
          `update "At"
           set "vendorId" = null
           where "vendorId" = :vendorId`,
          {
            replacements: { vendorId: nvAccessVendorId },
            transaction
          }
        );

        await queryInterface.sequelize.query(
          `delete
           from "Vendor"
           where id = :vendorId`,
          {
            replacements: { vendorId: nvAccessVendorId },
            transaction
          }
        );
      }
    });
  }
};
