const envConfig = require('dotenv').config().parsed || {};
const devConfig = require('../../config/database.json').dev;

exports.getDbConfig = function() {
    // This is the environment variable Heroku exposes
    const connectionString = process.env.DATABASE_URL || envConfig.DATABASE_URL;
    if (connectionString) {
        return {
            connectionString,
            ssl: true,
            sslmode: 'require'
        };
    }

    return devConfig;
};
