const MODEL_NAME = 'At';

module.exports = function(sequelize, DataTypes) {
    const Model = sequelize.define(
        MODEL_NAME,
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.TEXT,
                allowNull: false
            }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );

    Model.AT_VERSION_ASSOCIATION = { as: 'versions' };

    Model.AT_MODE_ASSOCIATION = { as: 'modes' };

    Model.associate = function(models) {
        Model.hasMany(models.AtVersion, {
            ...Model.AT_VERSION_ASSOCIATION,
            foreignKey: 'at',
            sourceKey: 'id'
        });

        Model.hasMany(models.AtMode, {
            ...Model.AT_MODE_ASSOCIATION,
            foreignKey: 'at',
            sourceKey: 'id'
        });
    };

    return Model;
};
