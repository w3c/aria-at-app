/* eslint-disable no-unused-vars */
const MODEL_NAME = 'TestPlanTarget';

module.exports = function(sequelize, DataTypes) {
    const Model = sequelize.define(
        MODEL_NAME,
        {},
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );

    Model.associate = function(models) {};

    return Model;
};
