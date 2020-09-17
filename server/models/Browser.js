module.exports = function(sequelize, DataTypes) {
    const Browser = sequelize.define(
        'Browser',
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
            tableName: 'browser'
        }
    );

    Browser.CHROME = 'Chrome';
    Browser.FIREFOX = 'Firefox';
    Browser.SAFARI = 'Safari';

    return Browser;
};
