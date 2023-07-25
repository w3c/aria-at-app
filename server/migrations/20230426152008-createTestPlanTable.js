'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const t = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.createTable(
                'TestPlan',
                {
                    id: {
                        type: Sequelize.DataTypes.INTEGER,
                        allowNull: false,
                        primaryKey: true,
                        autoIncrement: true
                    },
                    title: Sequelize.DataTypes.TEXT,
                    directory: Sequelize.DataTypes.TEXT
                },
                { transaction: t }
            );

            await queryInterface.addColumn(
                'TestPlanVersion',
                'testPlanId',
                { type: Sequelize.DataTypes.INTEGER },
                { transaction: t }
            );

            await queryInterface.addColumn(
                'TestPlanReport',
                'testPlanId',
                { type: Sequelize.DataTypes.INTEGER },
                { transaction: t }
            );

            await t.commit();
        } catch (error) {
            await t.rollback();
        }
    },

    async down(queryInterface) {
        const t = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.removeColumn('TestPlanVersion', 'testPlanId', {
                transaction: t
            });
            await queryInterface.removeColumn('TestPlanReport', 'testPlanId', {
                transaction: t
            });

            await t.commit();
        } catch (error) {
            await t.rollback();
        }
    }
};
