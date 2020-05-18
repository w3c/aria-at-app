module.exports = function(sequelize, DataTypes) {
    let AtName = sequelize.define(
        'AtName',
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.TEXT,
                allowNull: true,
                unique: true
            }
        },
        {
            timestamps: false,
            tableName: 'at_name'
        }
    );

    AtName.associate = function(models) {
        models.AtName.hasMany(models.AtVersion, {
            foreignKey: 'at_name_id',
            sourceKey: 'id'
        });
        models.AtName.hasMany(models.At, {
            foreignKey: 'at_name_id',
            sourceKey: 'id'
        });
    };

    return AtName;
};
