const session = require('express-session');
const { Pool } = require('pg');
const pgSession = require('connect-pg-simple')(session);
const { getDbConfig } = require('../util/db-config');
const poolConfig = getDbConfig();

module.exports = {
    session: session({
        secret: process.env.SESSION_SECRET || 'aria at report',
        resave: false,
        saveUninitialized: true,
        store: new pgSession({
            pool: new Pool(poolConfig),
            tableName: 'session',
        }),
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    }),
};
