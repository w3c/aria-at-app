const MODEL_NAME = 'TestPlan';

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
            title: { type: DataTypes.TEXT },
            publishStatus: { type: DataTypes.TEXT },
            revision: { type: DataTypes.TEXT }, // for semver-ed git tags from the imported test plan
            sourceGitCommitHash: { type: DataTypes.TEXT },
            sourceGitCommitMessage: { type: DataTypes.TEXT },
            exampleUrl: { type: DataTypes.TEXT },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            parsedTest: { type: DataTypes.JSONB }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );

    return Model;
};
