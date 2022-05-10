'use strict';
const { AtVersion, BrowserVersion } = require('../models');

module.exports = {
    up: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            await AtVersion.destroy({ truncate: true, transaction });
            await BrowserVersion.destroy({ truncate: true, transaction });

            await AtVersion.bulkCreate(
                [
                    {
                        atId: 1,
                        name: '2021.2111.13',
                        releasedAt: new Date('2021/11/01')
                    },
                    {
                        atId: 2,
                        name: '2020.4',
                        releasedAt: new Date('2021/02/19')
                    },
                    {
                        atId: 3,
                        name: '11.6 (20G165)',
                        releasedAt: new Date('2019/09/01')
                    }
                ],
                { transaction }
            );

            await BrowserVersion.bulkCreate(
                [
                    {
                        browserId: 1,
                        name: '99.0.1'
                    },
                    {
                        browserId: 2,
                        name: '99.0.4844.84'
                    },
                    {
                        browserId: 3,
                        name: '14.1.2'
                    }
                ],
                { transaction }
            );
        });
    }
};
