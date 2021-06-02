'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn(
                'TestPlanReport',
                'inTestQueue',
                {
                    type: Sequelize.DataTypes.BOOLEAN,
                    defaultValue: true
                },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'Role',
                { name: 'ADMIN' },
                { name: 'admin' },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'Role',
                { name: 'TESTER' },
                { name: 'tester' },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'UserRoles',
                { roleName: 'ADMIN' },
                { roleName: 'admin' },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'UserRoles',
                { roleName: 'TESTER' },
                { roleName: 'tester' },
                { transaction }
            );
        });
    },

    down: (queryInterface /* , Sequelize */) => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeColumn('TestPlanReport', 'inTestQueue');
            await queryInterface.bulkUpdate(
                'Role',
                { name: 'admin' },
                { name: 'ADMIN' },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'Role',
                { name: 'tester' },
                { name: 'TESTER' },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'UserRoles',
                { roleName: 'admin' },
                { roleName: 'ADMIN' },
                { transaction }
            );
            await queryInterface.bulkUpdate(
                'UserRoles',
                { roleName: 'tester' },
                { roleName: 'TESTER' },
                { transaction }
            );
        });
    }
};
