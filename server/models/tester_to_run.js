/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tester_to_run', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
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
    }
  }, {
    tableName: 'tester_to_run'
  });
};
