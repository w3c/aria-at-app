'use strict';
const fs = require('fs').promises;
const path = require('path');
const { VENDOR_NAME_TO_AT_MAPPING } = require('../util/constants');

const getVendorsFromFile = async () => {
  const vendorsFilePath = path.join(__dirname, '..', '..', 'vendors.txt');
  const vendorsContent = await fs.readFile(vendorsFilePath, 'utf-8');
  return vendorsContent
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'));
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const vendorLines = await getVendorsFromFile();

    for (const line of vendorLines) {
      const [username, companyName] = line.split('|');
      if (username && companyName) {
        // Create vendor if it doesn't exist
        const [vendor] = await queryInterface.sequelize.query(
          `INSERT INTO "Vendor" (name, "createdAt", "updatedAt") 
           VALUES (:name, NOW(), NOW()) 
           ON CONFLICT (name) DO UPDATE SET name = :name 
           RETURNING id`,
          {
            replacements: { name: companyName },
            type: Sequelize.QueryTypes.INSERT
          }
        );

        // Associate user with vendor if user exists
        await queryInterface.sequelize.query(
          `UPDATE "User" SET "vendorId" = :vendorId 
           WHERE username = :username`,
          {
            replacements: { vendorId: vendor[0].id, username },
            type: Sequelize.QueryTypes.UPDATE
          }
        );

        if (VENDOR_NAME_TO_AT_MAPPING[companyName]) {
          for (const atName of VENDOR_NAME_TO_AT_MAPPING[companyName]) {
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
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const vendorLines = await getVendorsFromFile();

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
