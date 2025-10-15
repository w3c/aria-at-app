const { Router } = require('express');
const {
  downloadARIAHtmlFeaturesCSV
} = require('../controllers/MetricsController');

const router = Router();

router.get('/aria-html-features.csv', downloadARIAHtmlFeaturesCSV);

module.exports = router;
