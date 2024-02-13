const db = require('../../models/index');

/**
 * Uses a transaction to clean up the database after each test.
 * @param {function} callback - async function
 * @returns {*}
 */
const dbCleaner = async callback => {
    const t = await db.sequelize.transaction();
    try {
        await callback(t);
        await t.rollback();
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

module.exports = dbCleaner;
