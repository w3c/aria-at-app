const express = require('express');
const path = require('path');

const { listener } = require('./app');
const port = process.env.PORT || 5000;

// TODO: make this path configurable
listener.use(
    '/aria-at',
    express.static(path.join(__dirname, process.env.ARIA_AT_REPO_DIR))
);

listener.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening on ${port}`);
});

module.exports = { listener };
