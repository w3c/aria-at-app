'use strict';

const fs = require('fs');

module.exports = {
    up: (queryInterface) => {
        return queryInterface.sequelize.transaction((transaction) => {
            return Promise.all([
                queryInterface.dropTable('at_name', {
                    cascade: true,
                    transaction,
                }),
                queryInterface.dropTable('browser', {
                    cascade: true,
                    transaction,
                }),
                queryInterface.dropTable('at_version', {
                    cascade: true,
                    transaction,
                }),
                queryInterface.dropTable('browser_version', {
                    cascade: true,
                    transaction,
                }),
                queryInterface.dropTable('test_version', {
                    cascade: true,
                    transaction,
                }),
                queryInterface.dropTable('run_status', {
                    cascade: true,
                    transaction,
                }),
                queryInterface.dropTable('browser_version_to_at_version', {
                    cascade: true,
                    transaction,
                }),
                queryInterface.dropTable('apg_example', {
                    cascade: true,
                    transaction,
                }),
                queryInterface.dropTable('at', { cascade: true, transaction }),
                queryInterface.dropTable('role', {
                    cascade: true,
                    transaction,
                }),
                queryInterface.dropTable('users', {
                    cascade: true,
                    transaction,
                }),
                queryInterface.dropTable('test_status', {
                    cascade: true,
                    transaction,
                }),
                queryInterface.dropTable('run', { cascade: true, transaction }),
                queryInterface.dropTable('test', {
                    cascade: true,
                    transaction,
                }),
                queryInterface.dropTable('user_to_role', {
                    cascade: true,
                    transaction,
                }),
                queryInterface.dropTable('user_to_at', {
                    cascade: true,
                    transaction,
                }),
                queryInterface.dropTable('tester_to_run', {
                    cascade: true,
                    transaction,
                }),
                queryInterface.dropTable('test_result', {
                    cascade: true,
                    transaction,
                }),
                queryInterface.dropTable('test_issue', {
                    cascade: true,
                    transaction,
                }),
                queryInterface.dropTable('test_to_at', {
                    cascade: true,
                    transaction,
                }),
                Promise.resolve()
                    .then(() =>
                        fs.readFileSync(
                            __dirname + '/pg_dump_2021_05_new_schema.sql',
                            'utf-8'
                        )
                    )
                    .then((initialSchema) =>
                        queryInterface.sequelize.query(initialSchema)
                    ),
            ]);
        });
    },

    down: (queryInterface) => {
        return queryInterface.dropAllTables();
    },
};
