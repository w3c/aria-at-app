'use strict';

const {
    updateTestPlanVersion
} = require('../models/services/TestPlanVersionService');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async transaction => {
            const testPlanReportsQuery = await queryInterface.sequelize.query(
                `select id, "testPlanVersionId", "candidateStatusReachedAt", "recommendedStatusReachedAt", "recommendedStatusTargetDate"
                        from "TestPlanReport"
                        where status in ('CANDIDATE', 'RECOMMENDED')`,
                {
                    transaction
                }
            );
            const testPlanReportsData = testPlanReportsQuery[0];

            for (let i = 0; i < testPlanReportsData.length; i++) {
                const {
                    testPlanVersionId,
                    candidateStatusReachedAt,
                    recommendedStatusReachedAt,
                    recommendedStatusTargetDate
                } = testPlanReportsData[i];

                await updateTestPlanVersion(testPlanVersionId, {
                    candidateStatusReachedAt,
                    recommendedStatusReachedAt,
                    recommendedStatusTargetDate
                });
            }

            // TODO: Because we need to rely on a single TestPlanVersion now, rather than having
            //  consolidated, we need to do the following:
            // TODO: Determine which TestPlanReport is the latest TestPlanVersion for a report
            //  group
            // TODO: Determine which TestPlanReports need to be updated to that latest version
            //  (without losing data, but there may need to be some manual updates that will have
            //  to happen)
        });
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
    }
};
