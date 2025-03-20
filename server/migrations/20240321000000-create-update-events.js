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
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: 'GENERAL'
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      }
    });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('UpdateEvent');
  }
};
