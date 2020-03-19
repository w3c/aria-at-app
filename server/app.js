const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Hello World!'));

const listener = express();
listener.use('/api', app);

module.exports = listener;
