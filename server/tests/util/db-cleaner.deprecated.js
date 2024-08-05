const db = require('../../models/index');

/**
 * Uses a global transaction to clean up the database after each test. All
 * functions which work with the database must check for the
 * global.globalTestTransaction.
 * @param {function} callback - async function
 * @returns {*}
 */
const dbCleaner = async callback => {
  global.globalTestTransaction = await db.sequelize.transaction();
  try {
    await callback();
    await global.globalTestTransaction.rollback();
    global.globalTestTransaction = undefined;
  } catch (error) {
    await global.globalTestTransaction.rollback();
    global.globalTestTransaction = undefined;
    throw error;
  }
};

module.exports = dbCleaner;
