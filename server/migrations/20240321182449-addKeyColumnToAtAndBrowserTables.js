'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn(
                'At',
                'key',
                {
                    type: Sequelize.DataTypes.TEXT
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'Browser',
                'key',
                {
                    type: Sequelize.DataTypes.TEXT
                },
                { transaction }
            );
        });
    },

    down: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeColumn('At', 'key', {
                transaction
            });
            await queryInterface.removeColumn('Browser', 'key', {
                transaction
            });
        });
    }
};
