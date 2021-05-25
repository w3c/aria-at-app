const MODEL_NAME = 'Browser';

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

    Model.CHROME = 'Chrome';
    Model.FIREFOX = 'Firefox';
    Model.SAFARI = 'Safari';

    Model.BROWSER_VERSION_ASSOCIATION = { as: 'versions' };

    Model.associate = function(models) {
        Model.hasMany(models.BrowserVersion, {
            ...Model.BROWSER_VERSION_ASSOCIATION,
            foreignKey: 'browserId',
            sourceKey: 'id'
        });
    };

    return Model;
};
