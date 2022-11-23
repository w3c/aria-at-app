'use strict';

module.exports = {
    up: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.sequelize.query(
                `update "TestPlanVersion"
                  set tests = update_data.updated_tests
                  from (select id,
                    jsonb_agg(
                        jsonb_set(elements, '{viewers}', '[]'::jsonb)
                    ) as updated_tests
                    from "TestPlanVersion",
                        jsonb_array_elements("TestPlanVersion".tests) as elements
                    group by id) update_data
                  where update_data.id = "TestPlanVersion".id;`,
                { transaction }
            );
        });
    },

    down: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.sequelize.query(
                `update "TestPlanVersion"
                  set tests = update_data.updated_tests
                  from (select id,
                    jsonb_agg(elements - 'viewers'
                    ) as updated_tests
                    from "TestPlanVersion",
                        jsonb_array_elements("TestPlanVersion".tests) as elements
                    group by id) update_data
                  where update_data.id = "TestPlanVersion".id;`,
                { transaction }
            );
        });
    }
};
