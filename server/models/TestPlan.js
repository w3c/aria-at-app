const MODEL_NAME = 'TestPlan';

const STATUS = {
    DRAFT: 'draft',
    IN_REVIEW: 'in_review',
    FINAL: 'final'
};

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
            publishStatus: {
                type: DataTypes.TEXT,
                // type: DataTypes.ENUM(
                //     STATUS.DRAFT,
                //     STATUS.IN_REVIEW,
                //     STATUS.FINAL
                // ),
                allowNull: false,
                defaultValue: STATUS.DRAFT
            },
            sourceGitCommitHash: { type: DataTypes.TEXT },
            sourceGitCommitMessage: { type: DataTypes.TEXT },
            exampleUrl: { type: DataTypes.TEXT },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            parsed: { type: DataTypes.JSONB }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );

    Model.DRAFT = STATUS.DRAFT;
    Model.IN_REVIEW = STATUS.IN_REVIEW;
    Model.FINAL = STATUS.FINAL;

    Model.associate = function(models) {
        Model.hasMany(models.TestPlanReport, {
            as: 'testPlanReports',
            foreignKey: 'testPlan',
            sourceKey: 'id'
        });
    };

    return Model;
};
