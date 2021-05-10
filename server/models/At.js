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

    Model.associate = function(models) {
        Model.hasMany(models.AtVersion, {
            as: 'versions',
            foreignKey: 'id',
            sourceKey: 'at'
        });

        Model.hasMany(models.AtMode, {
            as: 'modes',
            foreignKey: 'id',
            sourceKey: 'at'
        });
    };

    return Model;
};
