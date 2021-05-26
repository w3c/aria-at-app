const MODEL_NAME = 'AtVersion';

module.exports = function (sequelize, DataTypes) {
    const Model = sequelize.define(
        MODEL_NAME,
        {
            atId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'At',
                    key: 'id',
                },
            },
            version: {
                type: DataTypes.TEXT,
                allowNull: false,
                primaryKey: true,
                unique: true,
            },
        },
        {
            timestamps: false,
            tableName: MODEL_NAME,
        }
    );

    Model.AT_ASSOCIATION = { foreignKey: 'atId' };

    Model.associate = function (models) {
        Model.belongsTo(models.At, {
            ...Model.AT_ASSOCIATION,
            targetKey: 'id',
            as: 'at',
        });
    };

    return Model;
};
