'use strict';

const fs = require('fs');
const path = require('path');
const { dumpDatabase } = require('./utils');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async transaction => {
      // Purge sequelize tracked migrations
      await queryInterface.sequelize.query(`delete
                                            from "SequelizeMeta"`);

      // Backup current database
      await dumpDatabase();

      // Confirm structure of tables, keys and sequences are created
      const sqlFilePath = path.join(
        __dirname,
        'dumps',
        'pg_dump_flatten_migrations_20240801.sql'
      );
      const sql = fs.readFileSync(sqlFilePath, 'utf-8');
      await queryInterface.sequelize.query(sql);

      // Preserve 'next' sequence values (especially important for how the
      // CollectionJob sequence is handled across the testing/prod environments
      const tableWithSequences = [
        '"At"',
        '"AtVersion"',
        '"Browser"',
        '"BrowserVersion"',
        '"CollectionJob"',
        '"CollectionJobTestStatus"',
        '"TestPlan"',
        '"TestPlanReport"',
        '"TestPlanRun"',
        '"TestPlanVersion"',
        '"User"'
      ];

      for (const tableWithSequence of tableWithSequences) {
        const [latest] = await queryInterface.sequelize.query(
          `select id
         from ${tableWithSequence}
         order by id desc
         limit 1`,
          {
            type: Sequelize.QueryTypes.SELECT,
            transaction
          }
        );

        if (latest) {
          await queryInterface.sequelize.query(
            `SELECT setval(pg_get_serial_sequence('${tableWithSequence}', 'id'), :currentSequenceValue)`,
            {
              replacements: { currentSequenceValue: latest.id },
              transaction
            }
          );
        }
      }
    });
  },
  async down() {}
};
