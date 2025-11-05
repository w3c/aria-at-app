const MODEL_NAME = 'AtBug';

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define(
    MODEL_NAME,
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      atId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'At',
          key: 'id'
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      timestamps: true,
      tableName: MODEL_NAME
    }
  );

  Model.AT_ASSOCIATION = {
    foreignKey: 'atId',
    as: 'at'
  };

  Model.ASSERTIONS_ASSOCIATION = {
    through: 'AssertionAtBug',
    as: 'assertions'
  };

  Model.NEGATIVE_SIDE_EFFECTS_ASSOCIATION = {
    through: 'NegativeSideEffectAtBug',
    as: 'negativeSideEffects'
  };

  Model.associate = function (models) {
    Model.belongsTo(models.At, {
      ...Model.AT_ASSOCIATION,
      targetKey: 'id'
    });

    Model.belongsToMany(models.Assertion, {
      ...Model.ASSERTIONS_ASSOCIATION,
      foreignKey: 'atBugId',
      otherKey: 'assertionId'
    });

    Model.belongsToMany(models.NegativeSideEffect, {
      through: models.NegativeSideEffectAtBug,
      foreignKey: 'atBugId',
      otherKey: 'negativeSideEffectId',
      as: 'negativeSideEffects'
    });
  };

  return Model;
};
