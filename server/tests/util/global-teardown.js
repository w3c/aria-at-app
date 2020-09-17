const db = require('../../models/index');

module.exports = async function () {
   await db.sequelize.close();
};
