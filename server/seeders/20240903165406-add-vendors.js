'use strict';

const { VENDOR_NAME_TO_AT_MAPPING } = require('../util/constants');
const getUsersFromFile = require('../util/getUsersFromFile');

module.exports = {
  async up(queryInterface, Sequelize) {
    const vendorLines = await getUsersFromFile('vendors.txt');

    const vendorToUsers = new Map();
    for (const line of vendorLines) {
      const [username, companyName] = line.split('|');
      if (username && companyName) {
        if (!vendorToUsers.has(companyName)) {
          vendorToUsers.set(companyName, []);
        }
        vendorToUsers.get(companyName).push(username);
      }
    }

    // Create vendor if it doesn't exist
    for (const [companyName, companyInfo] of Object.entries(
      VENDOR_NAME_TO_AT_MAPPING
    )) {
      const [vendor] = await queryInterface.sequelize.query(
        `INSERT INTO "Vendor" (id, name, "createdAt", "updatedAt")
         VALUES (:id, :name, NOW(), NOW())
         ON CONFLICT (name) DO UPDATE SET name = :name
         RETURNING id`,
        {
          replacements: { id: companyInfo.id, name: companyName },
          type: Sequelize.QueryTypes.INSERT
        }
      );

      // Update sequence to ensure nextval is curr + 1
      await queryInterface.sequelize.query(
        `SELECT setval(pg_get_serial_sequence('"Vendor"', 'id'), :id, false)`,
        {
          replacements: { id: vendor[0].id },
          type: Sequelize.QueryTypes.SELECT
        }
      );

      // Associate user with vendor if user exists
      const usernames = vendorToUsers.get(companyName);
      if (usernames) {
        for (const username of usernames) {
          await queryInterface.sequelize.query(
            `UPDATE "User" SET "vendorId" = :vendorId
           WHERE username = :username`,
            {
              replacements: { vendorId: vendor[0].id, username },
              type: Sequelize.QueryTypes.UPDATE
            }
          );
        }
      }

      for (const atName of companyInfo.ats) {
        await queryInterface.sequelize.query(
          `UPDATE "At" SET "vendorId" = :vendorId
           WHERE name = :atName`,
          {
            replacements: { vendorId: vendor[0].id, atName },
            type: Sequelize.QueryTypes.UPDATE
          }
        );
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const vendorLines = await getUsersFromFile('vendors.txt');

    await queryInterface.sequelize.query(
      `DELETE FROM "Vendor" WHERE name IN (:vendorNames)`,
      {
        replacements: {
          vendorNames: vendorLines.map(line => line.split('|')[1])
        },
        type: Sequelize.QueryTypes.DELETE
      }
    );
  }
};
