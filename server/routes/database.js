const { Router } = require('express');
const {
  dumpPostgresDatabase,
  restorePostgresDatabase,
  cleanFolder
} = require('../controllers/DatabaseController');

const router = Router();

router.post('/dump', dumpPostgresDatabase);
router.post('/restore', restorePostgresDatabase);
router.post('/cleanFolder', cleanFolder);

module.exports = router;
