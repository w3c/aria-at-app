const MODEL_NAME = 'TestPlanTarget';

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
            title: { type: DataTypes.TEXT },
            atId: { type: DataTypes.INTEGER },
            browserId: { type: DataTypes.INTEGER },
            atVersion: {
                type: DataTypes.TEXT,
                references: {
                    model: 'AtVersion',
                    key: 'atVersion'
                }
            },
            browserVersion: {
                type: DataTypes.TEXT,
                references: {
                    model: 'BrowserVersion',
                    key: 'browserVersion'
                }
            }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );

    Model.AT_ASSOCIATION = { foreignKey: 'atId' };

    Model.AT_VERSION_ASSOCIATION = { foreignKey: 'atVersion' };

    Model.BROWSER_ASSOCIATION = { foreignKey: 'browserId' };

    Model.BROWSER_VERSION_ASSOCIATION = { foreignKey: 'browserVersion' };

    Model.associate = function(models) {
        Model.belongsTo(models.At, {
            ...Model.AT_ASSOCIATION,
            targetKey: 'id'
        });

        Model.belongsTo(models.AtVersion, {
            ...Model.AT_VERSION_ASSOCIATION,
            targetKey: 'atVersion'
        });

        Model.belongsTo(models.Browser, {
            ...Model.BROWSER_ASSOCIATION,
            targetKey: 'id'
        });

        Model.belongsTo(models.BrowserVersion, {
            ...Model.BROWSER_VERSION_ASSOCIATION,
            targetKey: 'browserVersion'
        });
    };

    return Model;
};
