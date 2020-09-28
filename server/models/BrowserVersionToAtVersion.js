module.exports = (sequelize, DataTypes) => {
    const BrowserVersionToAtVersion = sequelize.define(
        'BrowserVersionToAtVersion',
        {
            browser_version_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'browser_version',
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
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        },
        {
            tableName: 'browser_version_to_at_version'
        }
    );

    BrowserVersionToAtVersion.associate = function(models) {
        models.BrowserVersionToAtVersion.belongsTo(models.BrowserVersion, {
            foreignKey: 'browser_version_id'
        });
        models.BrowserVersionToAtVersion.belongsTo(models.AtVersion, {
            foreignKey: 'at_version_id'
        });
    };

    return BrowserVersionToAtVersion;
};
