'use strict';

const { regenerateResultsAndRecalculateHashes } = require('./utils');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        return queryInterface.sequelize.transaction(async transaction => {
            await regenerateResultsAndRecalculateHashes(
                queryInterface,
                transaction,
                {
                    testPlanVersionWhere: `WHERE metadata->>'testFormatVersion' = '2'`
                }
            );
        });
    }
};
