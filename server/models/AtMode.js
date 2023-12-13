const MODEL_NAME = 'AtMode';

const MODE = {
    READING: 'reading',
    INTERACTION: 'interaction',
    MODELESS: 'modeless'
};

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
                    key: 'id'
                }
            },
            name: {
                type: DataTypes.TEXT,
                defaultValue: MODE.MODELESS,
                allowNull: false,
                primaryKey: true
            },
            screenText: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            instructions: {
                type: DataTypes.ARRAY(DataTypes.TEXT),
                allowNull: true
            }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );

    Model.READING = MODE.READING;
    Model.INTERACTION = MODE.INTERACTION;
    Model.MODELESS = MODE.MODELESS;

    Model.AT_ASSOCIATION = { foreignKey: 'atId' };

    Model.associate = function (models) {
        Model.belongsTo(models.At, {
            ...Model.AT_ASSOCIATION,
            targetKey: 'id',
            as: 'at'
        });
    };

    return Model;
};
