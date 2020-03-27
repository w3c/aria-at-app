const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');

app.use(bodyParser.json());
app.use('/user', userRoutes);

const listener = express();
listener.use('/api', app);

module.exports = listener;
