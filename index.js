const express = require('express');
const history = require('connect-history-api-fallback');
const path = require('path');

const { listener } = require('./server/server');
// Need to use a fallback api so that the server
// can redirect to the frontend routes
listener.use(history()).use(express.static('./client/dist'));

listener.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './client/dist/index.html'));
});
