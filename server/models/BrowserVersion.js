const MODEL_NAME = 'BrowserVersion';

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
            browserId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Browser',
                    key: 'id'
                }
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

    Model.BROWSER_ASSOCIATION = { foreignKey: 'browserId' };

    Model.associate = function(models) {
        Model.belongsTo(models.Browser, {
            ...Model.BROWSER_ASSOCIATION,
            targetKey: 'id',
            as: 'browser'
        });
    };

    return Model;
};
