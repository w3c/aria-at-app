'use strict';
module.exports = (sequelize, DataTypes) => {
  const BrowserVersionToAtAndAtVersion = sequelize.define('BrowserVersionToAtAndAtVersion', {
    browser_version_id: DataTypes.INTEGER,
    at_version_id: DataTypes.INTEGER,
    at_id: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN
  }, {});
  BrowserVersionToAtAndAtVersion.associate = function(models) {
    // associations can be defined here
  };
  return BrowserVersionToAtAndAtVersion;
};