const MODEL_NAME = 'BrowserVersion';

module.exports = function (sequelize, DataTypes) {
    const Model = sequelize.define(
        MODEL_NAME,
        {
            browserId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'Browser',
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

    Model.BROWSER_ASSOCIATION = { foreignKey: 'browserId' };

    Model.associate = function (models) {
        Model.belongsTo(models.Browser, {
            ...Model.BROWSER_ASSOCIATION,
            targetKey: 'id',
            as: 'browser',
        });
    };

    return Model;
};
