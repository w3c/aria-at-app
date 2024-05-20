'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.createTable(
                'CollectionJobTestStatus',
                {
                    id: {
                        type: Sequelize.INTEGER,
                        primaryKey: true,
                        autoIncrement: true
                    },
                    testId: {
                        type: Sequelize.STRING,
                        allowNull: false
                    },
                    collectionJobId: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                        onDelete: 'CASCADE',
                        onUpdate: 'CASCADE',
                        references: {
                            model: 'CollectionJob',
                            key: 'id'
                        }
                    },
                    status: {
                        type: Sequelize.STRING,
                        allowNull: false,
                        defaultValue: 'QUEUED'
                    }
                },
                { transaction }
            );
            await queryInterface.addConstraint('CollectionJobTestStatus', {
                type: 'unique',
                name: 'CollectionJob_Test_unique',
                fields: ['collectionJobId', 'testId'],
                transaction
            });
        });
    },

    async down(queryInterface) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeConstraint(
                'CollectionJobTestStatus',
                'CollectionJob_Test_unique',
                { transaction }
            );
            await queryInterface.dropTable('CollectionJobTestStatus', {
                transaction
            });
        });
    }
};
