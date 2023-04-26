'use strict';

const { TestPlan } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        const testPlans = await TestPlan.findAll();

        const t = await queryInterface.sequelize.transaction();

        try {
            // Add Test Plan Ids to all Test Plan Versions
            await Promise.all(
                testPlans.map(testPlan => {
                    return queryInterface.bulkUpdate(
                        'TestPlanVersion',
                        {
                            testPlanId: testPlan.dataValues.id
                        },
                        {
                            directory: testPlan.dataValues.directory
                        },
                        { transaction: t }
                    );
                })
            );
            await t.commit();
        } catch (error) {
            await t.rollback();
        }
    },

    async down(queryInterface) {
        const testPlans = await TestPlan.findAll();
        const t = await queryInterface.sequelize.transaction();
        try {
            await Promise.all(
                testPlans.map(testPlan => {
                    return queryInterface.bulkUpdate(
                        'TestPlanVersion',
                        {
                            testPlanId: null
                        },
                        {
                            directory: testPlan.directory
                        },
                        { transaction: t }
                    );
                })
            );
            await t.commit();
        } catch (error) {
            await t.rollback();
        }
    }
};
