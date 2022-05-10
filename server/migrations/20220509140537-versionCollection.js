const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { AtVersion, BrowserVersion } = require('../models');
// Add the columns for atId and browserId to TestPlanReport table, and
// populate them with the atId and browserId which used to be in the
// TestPlanTarget table. This may require raw SQL due to the fact that
// the TestPlanTarget association was already removed from the code.
//
// Remove the TestPlanTarget table.
//
// Remove all existing AtVersions and BrowserVersions and replace with
// the most recent versions minus one (e.g. Chrome is at version 100
// right now so it would be Chrome 99.01.03. Replace 01 and 03 with real
// values).
//
// Loop over all the TestPlanRuns. Then loop over all the TestResults
// in each TestPlanRun. Then add pted atVersionId and
// browserVersionId fields.

module.exports = {
    up: (queryInterface, Sequelize) => {
        //Add the columns for atId and browserId to TestPlanReport table
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn(
                'TestPlanReport',
                'atId',
                {
                    type: Sequelize.DataTypes.INTEGER
                },
                { transaction }
            );
            await queryInterface.addColumn(
                'TestPlanReport',
                'browserId',
                {
                    type: Sequelize.DataTypes.INTEGER
                },
                { transaction }
            );
            // populate them with the atId and browserId which used to be in the
            // TestPlanTarget table.
            await queryInterface.sequelize.query(
                `
                UPDATE "TestPlanReport" as tpr
                SET
                "atId" = tpt."atId",
                "browserId" = tpt."browserId"
                FROM "TestPlanTarget" AS tpt 
                WHERE tpr."testPlanTargetId" = tpt.id
              `,
                { transaction }
            );

            try {
                await exec(
                    `pg_dump -t '"TestPlanTarget"' ${process.env.PGDATABASE} > ${__dirname}/pg_dump_test_plan_target.sql`
                );
            } catch (err) {
                console.error(err);
            }

            await queryInterface.dropTable('TestPlanTarget', {
                cascade: true,
                transaction
            });
        });
    },

    down: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeColumn('TestPlanReport', 'atId', {
                transaction
            });
            await queryInterface.removeColumn('TestPlanReport', 'browserId', {
                transaction
            });

            try {
                await exec(
                    `psql ${process.env.PGDATABASE} < ${__dirname}/pg_dump_test_plan_target.sql`
                );
            } catch (err) {
                console.error(err);
            }
        });
    }
};
