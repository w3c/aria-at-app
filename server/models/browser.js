/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('browser', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: true
    }
  }, {
    tableName: 'browser'
  });
};
