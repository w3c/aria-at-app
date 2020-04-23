const { Router } = require('express');
const post = require('../../tests/util/post');

const router = Router();

router.get('/', (req, res) => {
    res.status(200).send([{ id: 1, username: 'Foo Bar', configured_ats: [] }]);
});
router.post('/', post);
router.post('/role', post);
router.post('/ats', (req, res) => {
    res.status(200).send(req.body.ats);
});

module.exports = router;
