const express = require('express');
const path = require('path');

const { listener } = require('./server/server');
listener.use(express.static('./client/dist'));

listener.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './client/dist/index.html'));
});
