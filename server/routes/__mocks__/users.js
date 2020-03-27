const { Router } = require('express');
const post = require('../../tests/util/post');

const router = Router();

router.post('/', post);
router.post('/role', post);

module.exports = router;
