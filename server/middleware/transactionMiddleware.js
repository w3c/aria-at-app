const { sequelize } = require('../models');

const transactions = {};

/**
 * Using transactions is necessary to prevent the database from being
 * corrupted when errors occur during API requests. Only after a request has
 * been fully handled without errors should the transaction be committed and
 * the changes applied to the database.
 *
 * The transaction will be available in Express via `req.transaction, and in
 * GraphQL via `context.transaction`.
 *
 * It is possible to persist a transaction over multiple requests using the
 * "x-transaction-id" header. This is useful if multiple requests should
 * commit or roll back together (this is used to reset the database state in
 * end-to-end tests)
 */
const middleware = async (req, res, next) => {
  const transactionId = req.headers['x-transaction-id'];
  const isPersistentTransaction = !!transactionId;

  let transaction;
  if (transactionId && transactions[transactionId]) {
    transaction = transactions[transactionId];
  } else if (transactionId) {
    transaction = await sequelize.transaction();
    transactions[transactionId] = transaction;
  } else {
    transaction = await sequelize.transaction();
  }

  req.transaction = transaction;

  res.once('finish', async () => {
    if (!isPersistentTransaction && req.transaction) {
      await req.transaction.commit();
      delete req.transaction;
    }
  });

  return next();
};

const errorware = async (error, req, res, next) => {
  const transactionId = req.headers['x-transaction-id'];
  const isPersistentTransaction = !!transactionId;

  if (error) {
    if (!isPersistentTransaction && req.transaction) {
      await req.transaction.rollback();
      delete req.transaction;
    }
  }

  return next(error);
};

const forTestingPopulateTransaction = transaction => {
  transactions[transaction.id] = transaction;
};

const forTestingRollBackTransaction = async transaction => {
  await transaction.rollback();
  delete transactions[transaction.id];
};

module.exports = {
  middleware,
  errorware,
  forTestingPopulateTransaction,
  forTestingRollBackTransaction
};
