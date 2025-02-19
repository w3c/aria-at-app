const MODEL_NAME = 'VendorApprovalStatus';

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define(
    MODEL_NAME,
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'User',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      vendorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'Vendor',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      testPlanReportId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'TestPlanReport',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      testPlanVersionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'TestPlanVersion',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      viewedTests: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: [],
        allowNull: false
      },
      reviewStatus: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'IN_PROGRESS'
      },
      approvedAt: {
        type: DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      }
    },
    {
      timestamps: true,
      tableName: MODEL_NAME
    }
  );

  Model.USER_ASSOCIATION = { foreignKey: 'userId' };
  Model.VENDOR_ASSOCIATION = { foreignKey: 'vendorId' };
  Model.TEST_PLAN_REPORT_ASSOCIATION = { foreignKey: 'testPlanReportId' };
  Model.TEST_PLAN_VERSION_ASSOCIATION = { foreignKey: 'testPlanVersionId' };

  Model.associate = function (models) {
    Model.belongsTo(models.User, {
      ...Model.USER_ASSOCIATION,
      targetKey: 'id',
      as: 'user'
    });

    Model.belongsTo(models.Vendor, {
      ...Model.VENDOR_ASSOCIATION,
      targetKey: 'id',
      as: 'vendor'
    });

    Model.belongsTo(models.TestPlanReport, {
      ...Model.TEST_PLAN_REPORT_ASSOCIATION,
      targetKey: 'id',
      as: 'testPlanReport'
    });

    Model.belongsTo(models.TestPlanVersion, {
      ...Model.TEST_PLAN_VERSION_ASSOCIATION,
      targetKey: 'id',
      as: 'testPlanVersion'
    });
  };

  return Model;
};
