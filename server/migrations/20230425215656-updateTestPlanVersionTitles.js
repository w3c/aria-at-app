'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.sequelize.query(
                `update "TestPlanVersion" set title = 'Checkbox Example (Mixed-State)' where title = 'Checkbox Example (Tri State)'`,
                {
                    transaction
                }
            );

            await queryInterface.sequelize.query(
                `update "TestPlanVersion" set title = 'Alert Example' where title is null and directory = 'alert'`,
                {
                    transaction
                }
            );

            await queryInterface.sequelize.query(
                `update "TestPlanVersion" set title = 'Modal Dialog Example' where title is null and directory = 'modal-dialog'`,
                {
                    transaction
                }
            );
        });
    }
};
