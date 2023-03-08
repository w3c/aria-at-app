const envConfig = require('dotenv').config().parsed || {};

exports.getDbConfig = function () {
    return {
        driver: 'pg',
        user: envConfig.PGUSER,
        password: envConfig.PGPASSWORD,
        host: envConfig.PGHOST,
        database: envConfig.PGDATABASE
    };
};
