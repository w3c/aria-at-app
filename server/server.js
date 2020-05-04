const express = require('express');
const Sequelize = require('sequelize');
const path = require('path');

global.sequelize = new Sequelize(
    process.env.PGDATABASE,
    process.env.PGUSER,
    process.env.PGPASSWORD,
    {
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        dialect: 'postgres',
        dialectOption: {
            ssl: true,
            native: true
        },
        logging: console.log // eslint-disable-line no-console
    }
);
const { listener } = require('./app');
const port = process.env.PORT || 5000;

// TODO: make this path configurable
listener.use(
    '/aria-at',
    express.static(path.join(__dirname, process.env.ARIA_AT_REPO_DIR))
);

listener.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening on ${port}`);
});
