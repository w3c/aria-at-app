'use strict';
const { At, AtVersion, Browser, BrowserVersion } = require('../models');

module.exports = {
  up: queryInterface => {
    return queryInterface.sequelize.transaction(async transaction => {
      const ats = await At.findAll({ transaction });
      await AtVersion.destroy({ truncate: true, transaction });

      await AtVersion.bulkCreate(
        [
          {
            atId: ats.find(at => at.name === 'JAWS').id,
            name: '2021.2111.13',
            releasedAt: new Date('2021-11-01 04:00:00.000Z')
          },
          {
            atId: ats.find(at => at.name === 'NVDA').id,
            name: '2020.4',
            releasedAt: new Date('2021-02-19 00:00:00-05')
          },
          {
            atId: ats.find(at => at.name === 'VoiceOver for macOS').id,
            name: '11.6 (20G165)',
            releasedAt: new Date('2019-09-01 00:00:00-04')
          }
        ],
        { transaction }
      );

      await BrowserVersion.destroy({ truncate: true, transaction });
      const browsers = await Browser.findAll({ transaction });

      await BrowserVersion.bulkCreate(
        [
          {
            browserId: browsers.find(browser => browser.name === 'Firefox').id,
            name: '99.0.1'
          },
          {
            browserId: browsers.find(browser => browser.name === 'Chrome').id,
            name: '99.0.4844.84'
          },
          {
            browserId: browsers.find(browser => browser.name === 'Safari').id,
            name: '14.1.2'
          }
        ],
        { transaction }
      );
    });
  },

  down: queryInterface => {
    return queryInterface.sequelize.transaction(async transaction => {
      await AtVersion.destroy({
        truncate: true,
        restartIdentity: true,
        transaction
      });
      await BrowserVersion.destroy({
        truncate: true,
        restartIdentity: true,
        transaction
      });
    });
  }
};
