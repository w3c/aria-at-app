module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.addColumn(
        'User',
        'isBot',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        { transaction }
      );
      await queryInterface.sequelize.query(
        `UPDATE "User" SET "isBot" = true WHERE "username" LIKE '% Bot'`,
        { transaction }
      );
    });
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('User', 'isBot');
  }
};
