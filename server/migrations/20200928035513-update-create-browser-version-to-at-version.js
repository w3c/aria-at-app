'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      await queryInterface.removeColumn(
        'run',
        'browser_version_to_at_and_at_versions_id',
        { transaction: t }
      );
      await queryInterface.dropTable('BrowserVersionToAtAndAtVersions', {
        transaction: t
      });
      await queryInterface.createTable(
        'browser_version_to_at_version',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          browser_version_id: {
            type: Sequelize.INTEGER,
            references: {
              model: 'browser_version',
              key: 'id'
            },
            allowNull: false
          },
          at_version_id: {
            type: Sequelize.INTEGER,
            references: {
              model: 'at_version',
              key: 'id'
            },
            allowNull: false
          },
          active: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
          }
        },
        { transaction: t }
      );
      return queryInterface.addColumn(
        'run',
        'browser_version_to_at_versions_id',
        {
          type: Sequelize.INTEGER,
          references: {
            model: 'browser_version_to_at_version',
            key: 'id'
          }
        },
        { transaction: t }
      );
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      await queryInterface.removeColumn(
        'run',
        'browser_version_to_at_versions_id',
        { transaction: t }
      );
      await queryInterface.dropTable('browser_version_to_at_version', {
        transaction: t
      });
      await queryInterface.createTable(
        'BrowserVersionToAtAndAtVersions',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          browser_version_id: {
            type: Sequelize.INTEGER,
            references: {
              model: 'browser_version',
              key: 'id'
            },
            allowNull: false
          },
          at_version_id: {
            type: Sequelize.INTEGER,
            references: {
              model: 'at_version',
              key: 'id'
            },
            allowNull: false
          },
          at_id: {
            type: Sequelize.INTEGER,
            references: {
              model: 'at',
              key: 'id'
            },
            allowNull: false
          },
          active: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
          }
        },
        { transaction: t }
      );
      return queryInterface.addColumn(
        'run',
        'browser_version_to_at_and_at_versions_id',
        {
          type: Sequelize.INTEGER,
          references: {
            model: 'BrowserVersionToAtAndAtVersions',
            key: 'id'
          }
        },
        { transaction: t }
      );
    });
  }
};
