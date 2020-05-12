/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('test_version', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    git_repo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    git_tag: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    git_hash: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    git_commit_msg: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'test_version'
  });
};
