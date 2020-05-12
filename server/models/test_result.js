/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('test_result', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    test_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'test',
        key: 'id'
      }
    },
    run_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'run',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'test_status',
        key: 'id'
      }
    },
    result: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'test_result'
  });
};
