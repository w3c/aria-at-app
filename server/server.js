const express = require('express');
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
const http = require('http').createServer(listener)
const io = require('socket.io')(http);
const port = process.env.PORT || 5000;

// TODO: make this path configurable
listener.use(express.static(process.env.ARIA_AT_REPO_DIR));

io.on('connection', (socket) => {
    console.log('connected to IO')
    socket.on('clone', (msg) => {
        console.log('clone repo msg: ', msg)
    })
    socket.on('repoAvailable', () => {
        socket.emit('repoStatus', false);
    })
    socket.on('fromAPI', (msg) => {
        console.log(msg)
    })
});

http.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening on ${port}`);
});
