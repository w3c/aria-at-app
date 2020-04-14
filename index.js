const express = require('express');
const path = require('path');

const { listener } = require('./server');

listener.use(express.static('./dist'));

listener.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});
