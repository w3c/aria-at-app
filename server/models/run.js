/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('run', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    test_cycle_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'test_cycle',
        key: 'id'
      }
    },
    at_version_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'at_version',
        key: 'id'
      }
    },
    at_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'at',
        key: 'id'
      }
    },
    browser_version_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'browser_version',
        key: 'id'
      }
    },
    apg_example_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'apg_example',
        key: 'id'
      }
    }
  }, {
    tableName: 'run'
  });
};
