// A method for transactionally cleaning up after unit tests
// Inspired by the following issue:
// https://github.com/sequelize/sequelize/issues/11408
const db = require('../../models/index');

function dbCleaner(fn) {
    return new Promise((resolve, reject) => {
        db.sequelize.query('BEGIN;').then(() => {
            fn()
                .then(() => {
                    db.sequelize.query('ROLLBACK;').then(resolve);
                })
                .catch((err) => {
                    db.sequelize.query('ROLLBACK;').then(() => {
                        reject(err);
                    });
                });
        });
    });
}

module.exports = {
    dbCleaner,
};
