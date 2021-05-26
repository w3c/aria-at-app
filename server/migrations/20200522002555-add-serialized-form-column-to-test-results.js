'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('test_result', 'serialized_form', {
            type: Sequelize.JSONB
        });
    },

    down: queryInterface => {
        return queryInterface.removeColumn('test_result', 'serialized_form');
    }
};
