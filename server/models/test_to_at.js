/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('test_to_at', {
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
    at_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'at',
        key: 'id'
      }
    }
  }, {
    tableName: 'test_to_at'
  });
};
