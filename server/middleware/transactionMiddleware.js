const { sequelize } = require('../models');

const transactions = {};

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

module.exports = { middleware, errorware };
