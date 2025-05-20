const { Router } = require('express');
const {
  dumpPostgresDatabase,
  restorePostgresDatabase,
  cleanFolder,
  resetPostgresDatabase
} = require('../controllers/DatabaseController');

const router = Router();

router.post('/dump', dumpPostgresDatabase);
router.post('/restore', restorePostgresDatabase);
router.post('/cleanFolder', cleanFolder);
router.post('/reset', resetPostgresDatabase);

module.exports = router;
