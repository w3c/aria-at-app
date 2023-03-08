const MODEL_NAME = 'UserAts';

module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        MODEL_NAME,
        {
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'User',
                    key: 'id'
                },
                unique: true
            },
            atId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'At',
                    key: 'id'
                }
            }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );
};
