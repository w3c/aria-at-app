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
        return queryInterface.dropAllTables();
    }
};
