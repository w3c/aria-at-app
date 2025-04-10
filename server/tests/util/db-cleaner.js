const db = require('../../models/index');

/**
 * Uses a transaction to clean up the database after each test.
 * @param {function} callback - async function
 * @returns {*}
 */
const dbCleaner = async callback => {
  const transaction = await db.sequelize.transaction({
    isolationLevel: db.Sequelize.Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED
  });
  try {
    await callback(transaction);
    await transaction.rollback();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = dbCleaner;
