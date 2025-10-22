'use strict';

const { Browser } = require('../models');

module.exports = {
  up: async queryInterface => {
    const [edge] = await Browser.findOrCreate({
      where: { name: 'Microsoft Edge', key: 'MicrosoftEdge' }
    });

    const jawsAtId = 1;
    const nvdaAtId = 2;
    await queryInterface.bulkInsert(
      'AtBrowsers',
      // prettier-ignore
      [
                { atId: jawsAtId, browserId: edge.id, isCandidate: false, isRecommended: true },
                { atId: nvdaAtId, browserId: edge.id, isCandidate: false, isRecommended: true },
      ],
      {}
    );
  },

  down: async queryInterface => {
    const [edge] = await Browser.findOrCreate({
      where: { name: 'Microsoft Edge', key: 'MicrosoftEdge' }
    });
    await queryInterface.bulkDelete(
      'AtBrowsers',
      { browserId: edge.id },
      {
        cascade: true,
        truncate: true,
        restartIdentity: true
      }
    );
    await queryInterface.bulkDelete(
      'Browser',
      { name: 'Microsoft Edge' },
      {
        cascade: true,
        truncate: true,
        restartIdentity: true
      }
    );
  }
};
