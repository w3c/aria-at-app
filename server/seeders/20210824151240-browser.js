'use strict';

const { Browser } = require('../models');

module.exports = {
  up: async queryInterface => {
    if ((await Browser.findAll()).length) return;
    return queryInterface.bulkInsert(
      'Browser',
      [{ name: 'Firefox' }, { name: 'Chrome' }, { name: 'Safari' }],
      {}
    );
  },

  down: async queryInterface => {
    await queryInterface.bulkDelete('Browser', null, {
      cascade: true,
      truncate: true,
      restartIdentity: true
    });
  }
};
