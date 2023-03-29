'use strict';

module.exports = {
    up: async queryInterface => {
        await queryInterface.sequelize.query(
            `update "TestPlanReport" set status = 'DRAFT' where status = 'IN_REVIEW'`
        );
    }
};
