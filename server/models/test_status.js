/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('test_status', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'test_status'
  });
};
