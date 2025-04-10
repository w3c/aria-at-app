module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UpdateEvent', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM(
          'COLLECTION_JOB',
          'GENERAL',
          'TEST_PLAN_RUN',
          'TEST_PLAN_REPORT'
        ),
        allowNull: false,
        defaultValue: 'GENERAL'
      }
    });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('UpdateEvent');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_UpdateEvent_type";'
    );
  }
};
