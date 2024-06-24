const post = (req, res) => {
  // eslint-disable-next-line no-unused-vars
  return new Promise((resolve, reject) => {
    const newRole = req.body;
    res.status(201).send(newRole);
    resolve();
  });
};

module.exports = post;
