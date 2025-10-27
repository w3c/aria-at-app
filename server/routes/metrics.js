const { Router } = require('express');
const {
  downloadARIAHtmlFeaturesCSV,
  downloadARIAHtmlFeaturesDetailsCSV
} = require('../controllers/MetricsController');

const router = Router();

router.get('/aria-html-features.csv', downloadARIAHtmlFeaturesCSV);
router.get(
  '/aria-html-features/details.csv',
  downloadARIAHtmlFeaturesDetailsCSV
);

module.exports = router;
