/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('apg_example', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    directory: {
      type: DataTypes.TEXT,
      allowNull: true
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
    }
  }, {
    tableName: 'apg_example'
  });
};
