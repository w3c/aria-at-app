/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
        'BrowserVersion',
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            browser_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'browser',
                    key: 'id'
                },
                unique: true
            },
            version: {
                type: DataTypes.STRING,
                allowNull: true,
                primaryKey: true
            },
            release_order: {
                type: DataTypes.INTEGER,
                allowNull: true
            }
        },
        {
            timestamps: false,
            tableName: 'browser_version'
        }
    );
};
