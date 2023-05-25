'use strict';

module.exports = {
    up: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.sequelize.query(
                `update "TestPlanVersion"
                        set tests = update_data.updated_tests
                        from (select id,
                            jsonb_agg(
                                jsonb_build_object(
                                    'id', elements -> 'id',
                                    'atIds', elements -> 'atIds',
                                    'title', elements -> 'title',
                                    'atMode', elements -> 'atMode',
                                    'rowNumber', elements -> 'rowNumber',
                                    'scenarios', elements -> 'scenarios',
                                    'assertions', elements -> 'assertions',
                                    'renderedUrls', elements -> 'renderedUrls',
                                    'renderableContent', jsonb_strip_nulls(
                                        jsonb_build_object(
                                            '1', jsonb_set(
                                                (elements -> 'renderableContent' -> '1')::jsonb, '{instructions, mode}',
                                                    case
                                                        when elements -> 'renderableContent' -> '1' -> 'instructions' ->> 'mode' =
                                                            'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, turn on the Virtual Cursor by pressing Insert+Z.'
                                                            then '"Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape."'::jsonb
                                                        else (elements -> 'renderableContent' -> '1' -> 'instructions' -> 'mode')::jsonb
                                                    end),
                                            '2', (elements -> 'renderableContent' -> '2')::jsonb,
                                            '3', (elements -> 'renderableContent' -> '3')::jsonb)
                                        )
                                )
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
                            jsonb_agg(
                                jsonb_build_object(
                                    'id', elements -> 'id',
                                    'atIds', elements -> 'atIds',
                                    'title', elements -> 'title',
                                    'atMode', elements -> 'atMode',
                                    'rowNumber', elements -> 'rowNumber',
                                    'scenarios', elements -> 'scenarios',
                                    'assertions', elements -> 'assertions',
                                    'renderedUrls', elements -> 'renderedUrls',
                                    'renderableContent', jsonb_strip_nulls(
                                        jsonb_build_object(
                                            '1', jsonb_set(
                                                (elements -> 'renderableContent' -> '1')::jsonb, '{instructions, mode}',
                                                    case
                                                        when elements -> 'renderableContent' -> '1' -> 'instructions' ->> 'mode' =
                                                            'Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, exit Forms Mode to activate the Virtual Cursor by pressing Escape.'
                                                            then '"Verify the Virtual Cursor is active by pressing Alt+Delete. If it is not, turn on the Virtual Cursor by pressing Insert+Z."'::jsonb
                                                        else (elements -> 'renderableContent' -> '1' -> 'instructions' -> 'mode')::jsonb
                                                    end),
                                            '2', (elements -> 'renderableContent' -> '2')::jsonb,
                                            '3', (elements -> 'renderableContent' -> '3')::jsonb)
                                        )
                                )
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
