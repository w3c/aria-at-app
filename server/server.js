const { listener, server } = require('./app');
const port = process.env.PORT || 8000;

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on ${port}`);
});

module.exports = { listener, server };
