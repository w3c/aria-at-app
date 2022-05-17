const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');

module.exports = {
    up: (queryInterface, Sequelize) => {
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

            // Populate reports with the atId and browserId which used to be in the
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

            const testPlanTargetIds = await queryInterface.sequelize.query(
                `SELECT id, "testPlanTargetId" FROM "TestPlanReport"`,
                {
                    transaction
                }
            );

            const testPlanTargetIdData = testPlanTargetIds[0];
            testPlanTargetIdData.unshift('id,testPlanTargetId\n');
            const csvString = testPlanTargetIdData.reduce(
                (prev, current) =>
                    `${prev}${current.id},${current.testPlanTargetId}\n`
            );
            fs.writeFile(
                `${__dirname}/test_plan_target_id.csv`,
                csvString,
                err => {
                    if (err) {
                        console.error(err);
                    }
                }
            );

            await queryInterface.removeColumn(
                'TestPlanReport',
                'testPlanTargetId',
                {
                    transaction
                }
            );
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeColumn('TestPlanReport', 'atId', {
                transaction
            });
            await queryInterface.removeColumn('TestPlanReport', 'browserId', {
                transaction
            });

            await queryInterface.addColumn(
                'TestPlanReport',
                'testPlanTargetId',
                {
                    type: Sequelize.DataTypes.INTEGER
                },
                { transaction }
            );

            try {
                const data = fs.readFileSync(
                    `${__dirname}/test_plan_target_id.csv`,
                    'utf-8'
                );
                data.split('\n').forEach(async (value, i) => {
                    if (i === 0 || value === '') {
                        return;
                    }
                    const [id, testPlanTargetId] = value.split(',');
                    await queryInterface.sequelize.query(
                        `UPDATE "TestPlanReport"
                        SET "testPlanTargetId" = ${testPlanTargetId}
                        where id = ${id};`,
                        {
                            transaction
                        }
                    );
                });
            } catch (err) {
                console.error(err);
            }

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
