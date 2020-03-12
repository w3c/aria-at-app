const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => res.send('Hello World!'))

const listener = express();
listener.use('/api', app);
listener.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening on ${port}`);
});

module.exports = { listener, app };