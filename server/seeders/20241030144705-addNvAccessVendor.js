'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async transaction => {
      // Insert vendor if it doesn't exist, or get existing id
      const [vendor] = await queryInterface.sequelize.query(
        `insert into "Vendor" (name, "createdAt", "updatedAt")
         values ('nvAccess', now(), now())
         on conflict (name) do update set name = excluded.name
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
