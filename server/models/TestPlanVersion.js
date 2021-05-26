const MODEL_NAME = 'TestPlanVersion';

const STATUS = {
    DRAFT: 'DRAFT',
    IN_REVIEW: 'IN_REVIEW',
    FINALIZED: 'FINALIZED'
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
            status: {
                type: DataTypes.TEXT,
                // type: DataTypes.ENUM(
                //     STATUS.DRAFT,
                //     STATUS.IN_REVIEW,
                //     STATUS.FINALIZED
                // ),
                allowNull: false,
                defaultValue: STATUS.DRAFT
            },
            gitSha: { type: DataTypes.TEXT },
            gitMessage: { type: DataTypes.TEXT },
            exampleUrl: { type: DataTypes.TEXT },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            tests: { type: DataTypes.ARRAY(DataTypes.JSONB) },
            metadata: { type: DataTypes.JSONB }
        },
        {
            timestamps: false,
            tableName: MODEL_NAME
        }
    );

    Model.DRAFT = STATUS.DRAFT;
    Model.IN_REVIEW = STATUS.IN_REVIEW;
    Model.FINALIZED = STATUS.FINALIZED;

    return Model;
};
