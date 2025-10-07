'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('UpdateEvent', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'GENERAL'
    });

    await queryInterface.addColumn('UpdateEvent', 'performedByUserId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'User',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addColumn('UpdateEvent', 'entityId', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('UpdateEvent', 'metadata', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {}
    });

    await queryInterface.sequelize.query(
      `UPDATE "UpdateEvent" SET "type" = 'COLLECTION_JOB_CREATION' WHERE "type" = 'COLLECTION_JOB'`
    );

    await queryInterface.sequelize.query(
      `UPDATE "UpdateEvent" SET "type" = 'COLLECTION_JOB_TEST_PLAN_REPORT' WHERE "type" = 'TEST_PLAN_REPORT'`
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `UPDATE "UpdateEvent" SET "type" = 'TEST_PLAN_REPORT' WHERE "type" = 'COLLECTION_JOB_TEST_PLAN_REPORT'`
    );

    await queryInterface.sequelize.query(
      `UPDATE "UpdateEvent" SET "type" = 'COLLECTION_JOB' WHERE "type" = 'COLLECTION_JOB_CREATION'`
    );

    await queryInterface.removeColumn('UpdateEvent', 'metadata');
    await queryInterface.removeColumn('UpdateEvent', 'entityId');
    await queryInterface.removeColumn('UpdateEvent', 'performedByUserId');
  }
};
