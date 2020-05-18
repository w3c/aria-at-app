const Promise = require('bluebird');
const fs = require('fs');

module.exports = {
    up: queryInterface => {
        return Promise.resolve()
            .then(function() {
                return fs.readFileSync(
                    __dirname + '/pg_dump_from_flyway_migrations.dump',
                    'utf-8'
                );
            })
            .then(function(initialSchema) {
                return queryInterface.sequelize.query(initialSchema);
            });
    },

    down: queryInterface => {
        return queryInterface.sequelize.transaction(t => {
            // TODO: Fix order
            return Promise.all([
                queryInterface.dropTable('test_result', { transaction: t }),
                queryInterface.dropTable('tester_to_run', { transaction: t }),
                queryInterface.dropTable('user_to_at', { transaction: t }),
                queryInterface.dropTable('user_to_role', { transaction: t }),
                queryInterface.dropTable('test_to_at', { transaction: t }),
                queryInterface.dropTable('test', { transaction: t }),
                queryInterface.dropTable('apg_example', { transaction: t }),
                queryInterface.dropTable('at_version', { transaction: t }),
                queryInterface.dropTable('run', { transaction: t }),
                queryInterface.dropTable('at', { transaction: t }),
                queryInterface.dropTable('test_version', { transaction: t }),
                queryInterface.dropTable('test_cycle', { transaction: t }),
                queryInterface.dropTable('at_name', { transaction: t }),
                queryInterface.dropTable('browser_version', { transaction: t }),
                queryInterface.dropTable('browser', { transaction: t }),
                queryInterface.dropTable('role', { transaction: t }),
                queryInterface.dropTable('test_status', { transaction: t }),
                queryInterface.dropTable('session', { transaction: t }),
                queryInterface.dropTable('test_version', { transaction: t }),
                queryInterface.dropTable('users', { transaction: t })
            ]);
        });
    }
};
