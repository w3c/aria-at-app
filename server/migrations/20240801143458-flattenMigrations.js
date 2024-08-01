'use strict';

const fs = require('fs');
const path = require('path');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`DELETE FROM "SequelizeMeta"`);

    const sqlFilePath = path.join(__dirname, 'dumps', 'pg_dump_20240710.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');
    await queryInterface.sequelize.query(sql);
  },
  async down() {}
};
