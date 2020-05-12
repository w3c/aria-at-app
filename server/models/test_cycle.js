/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('test_cycle', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    test_version_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'test_version',
        key: 'id'
      }
    },
    created_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    tableName: 'test_cycle'
  });
};
