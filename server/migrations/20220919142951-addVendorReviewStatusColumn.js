'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn(
                'TestPlanReport',
                'vendorReviewStatus',
                {
                    type: Sequelize.DataTypes.TEXT,
                    defaultValue: null,
                    allowNull: true
                },
                { transaction }
            );
            await queryInterface.sequelize.query(
                `
              update "TestPlanReport" set "vendorReviewStatus" = 'READY' where status = 'IN_REVIEW';
              update "TestPlanReport" set "vendorReviewStatus" = 'APPROVED' where status = 'FINALIZED';
          `,
                { transaction }
            );
        });
    },

    down: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeColumn(
                'TestPlanReport',
                'vendorReviewStatus',
                { transaction }
            );
        });
    }
};
