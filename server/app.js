const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('./middleware/session');
const userRoutes = require('./routes/users');

// test session
app.use(session);
app.use(bodyParser.json());
app.use('/user', userRoutes);

const listener = express();
listener.use('/api', app);

module.exports = { app, listener };
