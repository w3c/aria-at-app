const MODEL_NAME = 'AtVersion';

module.exports = function(sequelize, DataTypes) {
    const Model = sequelize.define(
        MODEL_NAME,
        {
            at: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'At',
                    key: 'id'
                }
            },
            version: {
                type: DataTypes.TEXT,
                allowNull: true
            }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );

    Model.associate = function(models) {
        Model.belongsTo(models.At, {
            foreignKey: 'at'
        });
    };

    return Model;
};
