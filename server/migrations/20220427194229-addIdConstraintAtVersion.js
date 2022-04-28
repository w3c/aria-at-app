'use strict';

module.exports = {
    up: queryInterface => {
        return queryInterface.addConstraint('AtVersion', {
            type: 'primary key',
            name: 'AtVersion_pkey',
            fields: ['id']
        });
    },

    down: queryInterface => {
        return queryInterface.removeConstraint('AtVersion', 'AtVersion_pkey');
    }
};
