module.exports = {
    development: {
        database: process.env.PGDATABASE,
        username: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        dialect: 'postgres',
        dialectOption: {
            ssl: true,
            native: true
        },
        logging: console.log // eslint-disable-line no-console
    }
};
