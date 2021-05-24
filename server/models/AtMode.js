const MODEL_NAME = 'AtMode';

const MODE = {
    READING: 'reading',
    INTERACTION: 'interaction',
    MODELESS: 'modeless'
};

module.exports = function(sequelize, DataTypes) {
    const Model = sequelize.define(
        MODEL_NAME,
        {
            at: {
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
                // type: DataTypes.ENUM(
                //     MODE.READING,
                //     MODE.INTERACTION,
                //     MODE.MODELESS
                // ),
                defaultValue: MODE.MODELESS,
                allowNull: false,
                primaryKey: true
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

    Model.AT_ASSOCIATION = { foreignKey: 'at' };

    Model.associate = function(models) {
        Model.belongsTo(models.At, {
            ...Model.AT_ASSOCIATION,
            targetKey: 'id',
            as: 'atObject'
        });
    };

    return Model;
};
