/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
        'FlywaySchemaHistory',
        {
            installed_rank: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            version: {
                type: DataTypes.STRING,
                allowNull: true
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false
            },
            script: {
                type: DataTypes.STRING,
                allowNull: false
            },
            checksum: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            installed_by: {
                type: DataTypes.STRING,
                allowNull: false
            },
            installed_on: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize.fn('now')
            },
            execution_time: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            success: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            }
        },
        {
            timestamps: false,
            tableName: 'flyway_schema_history'
        }
    );
};
