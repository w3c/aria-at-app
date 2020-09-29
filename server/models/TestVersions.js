module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
        'TestVersion',
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            git_repo: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            git_tag: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            git_hash: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            git_commit_msg: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            datetime: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            timestamps: false,
            tableName: 'test_version'
        }
    );
};
