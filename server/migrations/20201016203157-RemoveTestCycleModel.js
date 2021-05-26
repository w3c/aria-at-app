'use strict';

module.exports = {
    up: (queryInterface) => {
        return queryInterface.sequelize.transaction((t) => {
            return Promise.all([
                queryInterface.dropTable('test_cycle', {
                    cascade: true,
                    transaction: t,
                }),
                queryInterface.sequelize.query('DROP VIEW run_data', {
                    transaction: t,
                }),
                queryInterface.removeColumn('run', 'test_cycle_id', {
                    transaction: t,
                }),
                queryInterface.removeColumn('run', 'at_version_id', {
                    transaction: t,
                }),
                queryInterface.removeColumn('run', 'at_id', {
                    transaction: t,
                }),
                queryInterface.removeColumn('run', 'browser_version_id', {
                    transaction: t,
                }),
            ]);
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction((t) => {
            return Promise.all([
                queryInterface.addColumn(
                    'run',
                    'test_cycle_id',
                    {
                        type: Sequelize.INTEGER,
                    },
                    { transaction: t }
                ),
                queryInterface.addColumn(
                    'run',
                    'at_version_id',
                    {
                        type: Sequelize.INTEGER,
                    },
                    { transaction: t }
                ),
                queryInterface.addColumn(
                    'run',
                    'at_id',
                    {
                        type: Sequelize.INTEGER,
                    },
                    { transaction: t }
                ),
                queryInterface.addColumn(
                    'run',
                    'browser_version_id',
                    {
                        type: Sequelize.INTEGER,
                    },
                    { transaction: t }
                ),
                queryInterface.createTable(
                    'test_cycle',
                    {
                        id: {
                            type: Sequelize.INTEGER,
                            allowNull: false,
                            primaryKey: true,
                            autoIncrement: true,
                        },
                        name: {
                            type: Sequelize.TEXT,
                            allowNull: true,
                        },
                        test_version_id: {
                            type: Sequelize.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'test_version',
                                key: 'id',
                            },
                        },
                        created_user_id: {
                            type: Sequelize.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'users',
                                key: 'id',
                            },
                        },
                        date: {
                            type: Sequelize.DATEONLY,
                            allowNull: true,
                        },
                    },
                    { transaction: t }
                ),

                queryInterface.sequelize.query(
                    `
                    CREATE VIEW public.run_data AS
                     SELECT run.id,
                        run.test_cycle_id,
                        browser_version.version AS browser_version,
                        browser.name AS browser_name,
                        browser.id AS browser_id,
                        at.key AS at_key,
                        at.id AS at_id,
                        at_name.name AS at_name,
                        at_name.id AS at_name_id,
                        at_version.version AS at_version,
                        apg_example.directory AS apg_example_directory,
                        apg_example.name AS apg_example_name,
                        apg_example.id AS apg_example_id
                       FROM public.run,
                        public.browser_version,
                        public.browser,
                        public.at,
                        public.at_name,
                        public.at_version,
                        public.apg_example
                      WHERE ((run.browser_version_id = browser_version.id) AND (browser_version.browser_id = browser.id) AND (run.at_id = at.id) AND (at.at_name_id = at_name.id) AND (run.at_version_id = at_version.id) AND (run.apg_example_id = apg_example.id));
                    `,
                    { transaction: t }
                ),
            ]);
        });
    },
};
