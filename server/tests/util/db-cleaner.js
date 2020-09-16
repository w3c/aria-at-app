// A method for transactionally cleaning up after unit tests
// Inspired by the following issue:
// https://github.com/sequelize/sequelize/issues/11408
const db = require('../../models/index');


function dbCleaner(fn) {
	return new Promise((resolve, reject) => {
		jest.unmock('../../models/index.js');
		console.log('HELP', db);
		console.log('HELP', db.sequelize);
		db.sequelize.transaction(() => {
			return fn().then(() => {
				resolve();
			}).catch(err => {
				reject(err);
			}).finally(() => {
				throw "Rollback";
			});
		}).catch(err => {
			if (err === "Rollback") return;
			reject(err);
		});
	});
}

module.exports = {
	dbCleaner
};
