'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async (transaction) => {
            // https://stackoverflow.com/a/45231776
            await queryInterface.sequelize.query(
                `ALTER TABLE "TestPlanVersion" ALTER COLUMN "tests" DROP DEFAULT;`,
                { transaction }
            );
            await queryInterface.changeColumn(
                'TestPlanVersion',
                'tests',
                {
                    type: 'JSONB USING to_jsonb(tests)',
                },
                { transaction }
            );
            await queryInterface.sequelize.query(
                `ALTER TABLE "TestPlanVersion" ALTER COLUMN "tests" SET DEFAULT '[]';`,
                { transaction }
            );
            await queryInterface.sequelize.query(
                `ALTER TABLE "TestPlanRun" ALTER COLUMN "testResults" DROP DEFAULT;`,
                { transaction }
            );
            await queryInterface.changeColumn(
                'TestPlanRun',
                'testResults',
                {
                    type: 'JSONB USING to_jsonb("testResults")',
                },
                { transaction }
            );
            await queryInterface.sequelize.query(
                `ALTER TABLE "TestPlanRun" ALTER COLUMN "testResults" SET DEFAULT '[]';`,
                { transaction }
            );
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.sequelize.query(
                `CREATE OR REPLACE FUNCTION jsonb_to_jsonb_array(jsonb)
                returns jsonb[] language sql as $$
                    select array_agg(elem)
                    from jsonb_array_elements($1) as elem
                $$;`,
                { transaction }
            );
            await queryInterface.sequelize.query(
                `ALTER TABLE "TestPlanVersion" ALTER COLUMN "tests" DROP DEFAULT;`,
                { transaction }
            );
            await queryInterface.changeColumn(
                'TestPlanVersion',
                'tests',
                {
                    type: 'JSONB[] USING jsonb_to_jsonb_array(tests)',
                },
                { transaction }
            );
            await queryInterface.sequelize.query(
                `ALTER TABLE "TestPlanVersion" ALTER COLUMN "tests" SET DEFAULT '{}';`,
                { transaction }
            );
            await queryInterface.sequelize.query(
                `ALTER TABLE "TestPlanRun" ALTER COLUMN "testResults" DROP DEFAULT;`,
                { transaction }
            );
            await queryInterface.changeColumn(
                'TestPlanRun',
                'testResults',
                {
                    type: 'JSONB[] USING jsonb_to_jsonb_array("testResults")',
                },
                { transaction }
            );
            await queryInterface.sequelize.query(
                `ALTER TABLE "TestPlanRun" ALTER COLUMN "testResults" SET DEFAULT '{}';`,
                { transaction }
            );
        });
    },
};
