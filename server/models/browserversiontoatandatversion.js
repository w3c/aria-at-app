module.exports = (sequelize, DataTypes) => {
    const BrowserVersionToAtAndAtVersion = sequelize.define(
        'BrowserVersionToAtAndAtVersion',
        {
            browser_version_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'broswer_version',
                    key: 'id'
                }
            },
            at_version_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'at_version',
                    key: 'id'
                }
            },
            at_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'at',
                    key: 'id'
                }
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        },
        {}
    );

    BrowserVersionToAtAndAtVersion.associate = function(models) {
        models.BrowserVersionToAtAndAtVersion.belongsTo(models.BrowserVersion, {
            foreignKey: 'browser_version_id'
        });
        models.BrowserVersionToAtAndAtVersion.belongsTo(models.AtVersion, {
            foreignKey: 'at_version_id'
        });
        models.BrowserVersionToAtAndAtVersion.belongsTo(models.At, {
            foreignKey: 'at_id'
        });
    };

    return BrowserVersionToAtAndAtVersion;
};
