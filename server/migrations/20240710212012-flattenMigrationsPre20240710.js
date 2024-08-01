'use strict';

const fs = require('fs');
const path = require('path');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const sqlFilePath = path.join(__dirname, 'pg_dump_20240710.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');

    return queryInterface.sequelize.query(sql);

    // return queryInterface.sequelize.transaction(() => {
    //   return Promise.all([
    //     Promise.resolve()
    //       .then(() =>
    //         fs.readFileSync(__dirname + '/pg_dump_20240710.sql', 'utf-8')
    //       )
    //       .then(sql => queryInterface.sequelize.query(sql))
    //   ]);
    // });
  },
  async down() {}
};
