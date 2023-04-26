'use strict';

const { TestPlanVersion } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Find all unique Test Plans
        const testPlanVersions = await TestPlanVersion.findAll();
        const testPlanVersionDetails = testPlanVersions.map(testPlanVersion => {
            return {
                title: testPlanVersion.dataValues.title,
                directory: testPlanVersion.dataValues.directory,
                updatedAt: testPlanVersion.dataValues.updatedAt
            };
        });
        const uniqueTestPlans = {};

        testPlanVersionDetails.forEach(testPlanVersion => {
            if (!(testPlanVersion.directory in uniqueTestPlans)) {
                uniqueTestPlans[testPlanVersion.directory] = testPlanVersion;
            } else {
                const existingTestPlan =
                    uniqueTestPlans[testPlanVersion.directory];
                if (
                    new Date(existingTestPlan.updatedAt) <
                    new Date(testPlanVersion.updatedAt)
                ) {
                    uniqueTestPlans[testPlanVersion.directory] =
                        testPlanVersion;
                }
            }
        });

        const t = await queryInterface.sequelize.transaction();

        try {
            const table = 'TestPlan';
            await queryInterface.bulkInsert(
                table,
                Object.values(uniqueTestPlans).map(testPlan => {
                    return {
                        title: testPlan.title,
                        directory: testPlan.directory
                    };
                }),
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
            await queryInterface.bulkDelete('TestPlan', null, {});
            await t.commit();
        } catch (error) {
            await t.rollback();
        }
    }
};
