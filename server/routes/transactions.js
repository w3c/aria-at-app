const { Router } = require('express');
const {
  forTestingPopulateTransaction,
  forTestingRollBackTransaction
} = require('../middleware/transactionMiddleware');
const { sequelize } = require('../models');

const router = Router();

router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  forTestingPopulateTransaction(transaction);
  res.send({ transactionId: transaction.id });
});

router.delete('/', async (req, res) => {
  const transactionId = req.headers['x-transaction-id'];
  await forTestingRollBackTransaction(transactionId);
  res.send();
});

module.exports = router;
