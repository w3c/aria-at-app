'use strict';

module.exports = {
  up: async (queryInterface /* , Sequelize */) => {
    const jawsAtId = 1;
    const nvdaAtId = 2;
    const voiceOverAtId = 3;

    const firefoxBrowserId = 1;
    const chromeBrowserId = 2;
    const safariBrowserId = 3;

    return queryInterface.bulkInsert(
      'AtBrowsers',
      // prettier-ignore
      [
                { atId: jawsAtId, browserId: firefoxBrowserId, isCandidate: false, isRecommended: true },
                { atId: jawsAtId, browserId: chromeBrowserId, isCandidate: true, isRecommended: true },
                { atId: nvdaAtId, browserId: firefoxBrowserId, isCandidate: false, isRecommended: true },
                { atId: nvdaAtId, browserId: chromeBrowserId, isCandidate: true, isRecommended: true },
                { atId: voiceOverAtId, browserId: safariBrowserId, isCandidate: true, isRecommended: true },
                { atId: voiceOverAtId, browserId: firefoxBrowserId, isCandidate: false, isRecommended: false },
                { atId: voiceOverAtId, browserId: chromeBrowserId, isCandidate: false, isRecommended: true }
            ],
      {}
    );
  },

  down: async (queryInterface /* , Sequelize */) => {
    await queryInterface.dropTable('AtBrowsers');
  }
};
