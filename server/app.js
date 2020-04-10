const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { session } = require('./middleware/session');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const cycleRoutes = require('./routes/cycle');

// test session
app.use(session);
app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/cycle', cycleRoutes);

const listener = express();
listener.use('/api', app);

module.exports = { app, listener };
