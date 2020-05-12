/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('at_version', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    at_name_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'at_name',
        key: 'id'
      },
      unique: true
    },
    version: {
      type: DataTypes.STRING,
      allowNull: true,
      primaryKey: true
    },
    release_order: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'at_version'
  });
};
