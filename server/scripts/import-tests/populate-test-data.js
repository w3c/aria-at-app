/* eslint-disable no-console */
const fs = require('fs');
const db = require('../../models');

const populateTestDatabase = async () => {
    const testDataScript = fs.readFileSync(
        __dirname + '/pg_dump_2021_05_test_data.sql',
        'utf-8'
    );
    console.info('test.data.dump', testDataScript);
    return await db.sequelize.query(testDataScript);
};

if (require.main === module)
    populateTestDatabase()
        .then(() => console.info('Successfully Populated'))
        .catch((error) => console.error('Database Population Error', error));

module.exports = populateTestDatabase;
