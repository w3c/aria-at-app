'use strict';

const { Role, User } = require('../models');

module.exports = {
    up: async queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            await Role.create({ name: 'VENDOR' }, { transaction });
        });
    },

    down: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            await Role.destroy({ where: { name: 'VENDOR' }, transaction });
        });
    }
};
