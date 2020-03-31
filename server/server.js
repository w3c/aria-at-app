const Sequelize = require('sequelize');
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

listener.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening on ${port}`);
});
