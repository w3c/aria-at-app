'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
          queryInterface.addColumn('apg_example', 'example', 
            { type: Sequelize.TEXT },
            { transaction: t }
          ),
          queryInterface.addColumn('apg_example', 'practice_guide', 
            { type: Sequelize.TEXT },
            { transaction: t }
          )
      ]);
  });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
   return queryInterface.sequelize.transaction(t => {
    return Promise.all([
        queryInterface.removeColumn('apg_example', 'example', {
            transaction: t
        }),
        queryInterface.removeColumn('apg_example', 'practice_guide', {
            transaction: t
        })
      ]);
    });
  }
};
