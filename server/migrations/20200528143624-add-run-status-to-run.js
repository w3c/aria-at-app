'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('run', 'run_status_id', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'run_status',
                key: 'id',
            },
        });
    },

    down: (queryInterface) => {
        return queryInterface.removeColumn('run', 'run_status_id');
    },
};
