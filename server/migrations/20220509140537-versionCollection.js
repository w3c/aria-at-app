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
                    `pg_dump -t '"TestPlanTarget"' -t '"AtVersion"' -t '"BrowserVersion"' ${process.env.PGDATABASE} > ${__dirname}/pg_dump_testplantarget_at_browser_version.sql`
                );
            } catch (err) {
                console.error(err);
            }

            await queryInterface.dropTable('TestPlanTarget', {
                cascade: true,
                transaction
            });

            await AtVersion.destroy({ truncate: true, transaction });
            await BrowserVersion.destroy({ truncate: true, transaction });

            await AtVersion.bulkCreate(
                [
                    {
                        atId: 1,
                        name: '2021.2111.13',
                        releasedAt: new Date('2021/11/01')
                    },
                    {
                        atId: 2,
                        name: '2020.4',
                        releasedAt: new Date('2021/02/19')
                    },
                    {
                        atId: 3,
                        name: '11.6 (20G165)',
                        releasedAt: new Date('2019/09/01')
                    }
                ],
                { transaction }
            );

            await BrowserVersion.bulkCreate(
                [
                    {
                        browserId: 1,
                        name: '99.0.1'
                    },
                    {
                        browserId: 2,
                        name: '99.0.4844.84'
                    },
                    {
                        browserId: 3,
                        name: '14.1.2'
                    }
                ],
                { transaction }
            );
        });
    },

    down: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            await AtVersion.destroy({ truncate: true, transaction });
            await BrowserVersion.destroy({ truncate: true, transaction });

            await queryInterface.removeColumn('TestPlanReport', 'atId', {
                transaction
            });
            await queryInterface.removeColumn('TestPlanReport', 'browserId', {
                transaction
            });

            try {
                await exec(
                    `psql ${process.env.PGDATABASE} < ${__dirname}/pg_dump_testplantarget_at_browser_version.sql`
                );
            } catch (err) {
                console.error(err);
            }
        });
    }
};
