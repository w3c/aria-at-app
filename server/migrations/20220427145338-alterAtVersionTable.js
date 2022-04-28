'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn(
                'AtVersion',
                'id',
                {
                    type: Sequelize.DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true
                },
                { transaction }
            );
            await queryInterface.addColumn(
                'AtVersion',
                'releasedAt',
                {
                    type: Sequelize.DataTypes.DATE
                },
                { transaction }
            );
        });
    },

    down: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeColumn('AtVersion', 'id', {
                transaction
            });
            await queryInterface.removeColumn('AtVersion', 'releasedAt', {
                transaction
            });
        });
    }
};
