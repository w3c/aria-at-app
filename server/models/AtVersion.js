const MODEL_NAME = 'AtVersion';

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
            atId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'At',
                    key: 'id'
                }
            },
            name: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            releasedAt: { type: DataTypes.DATE }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );

    Model.AT_ASSOCIATION = { foreignKey: 'atId' };

    Model.associate = function(models) {
        Model.belongsTo(models.At, {
            ...Model.AT_ASSOCIATION,
            targetKey: 'id',
            as: 'at'
        });
    };

    return Model;
};
