const db = require('../../models/index');

/**
 * Uses a global transaction to clean up the database after each test. All
 * functions which work with the database must check for the
 * global.globalTestTransaction.
 *
 * Inspired by the issue https://github.com/sequelize/sequelize/issues/11408
 * @param {function} callback - async function
 * @returns {*}
 */
const dbCleaner = async callback => {
    global.globalTestTransaction = await db.sequelize.transaction();
    try {
        await callback();
        // await db.sequelize.query('ROLLBACK;');
        await global.globalTestTransaction.rollback();
        global.globalTestTransaction = undefined;
    } catch (error) {
        // await db.sequelize.query('ROLLBACK;');
        await global.globalTestTransaction.rollback();
        global.globalTestTransaction = undefined;
        throw error;
    }
};

module.exports = dbCleaner;
