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
    BrowserVersionToAtAndAtVersion.associate = function() {
        // associations can be defined here
    };
    return BrowserVersionToAtAndAtVersion;
};
