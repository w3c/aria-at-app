'use strict';

const { Browser, BrowserVersion } = require('../models');

module.exports = {
  up: async queryInterface => {
    const [edge] = await Browser.findOrCreate({
      where: { name: 'Microsoft Edge', key: 'MicrosoftEdge' }
    });

    await BrowserVersion.bulkCreate([
      {
        browserId: edge.id,
        name: '141.0.3537.85'
      }
    ]);

    const jawsAtId = 1;
    const nvdaAtId = 2;
    await queryInterface.bulkInsert(
      'AtBrowsers',
      // prettier-ignore
      [
                { atId: jawsAtId, browserId: edge.id, isCandidate: false, isRecommended: false },
                { atId: nvdaAtId, browserId: edge.id, isCandidate: false, isRecommended: false },
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
