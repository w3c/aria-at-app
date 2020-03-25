const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { userRoutes } = require('./routes');

app.use(bodyParser.json());
app.get('/', (req, res) => res.send('Hello World!'));
app.use('/user', userRoutes);

const listener = express();
listener.use('/api', app);

module.exports = listener;
