const { Router } = require('express');

const router = Router();

router.post('/', (req, res) => {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
        const newUser = req.body;
        res.status(201).send(newUser);
        resolve();
    });
});

module.exports = router;
