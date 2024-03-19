'use strict';

const { Role } = require('../models');

module.exports = {
  up: async queryInterface => {
    if ((await Role.findAll()).length) return;
    await queryInterface.bulkInsert(
      'Role',
      [{ name: 'ADMIN' }, { name: 'TESTER' }],
      {}
    );
  },

  down: async queryInterface => {
    await queryInterface.bulkDelete('Role', null, {});
  }
};
