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

    req.t = transaction;

    res.once('finish', async () => {
        if (!isPersistentTransaction && req.t) {
            await req.t.commit();
            delete req.t;
        }
    });

    return next();
};

const errorware = async (error, req, res, next) => {
    const transactionId = req.headers['x-transaction-id'];
    const isPersistentTransaction = !!transactionId;

    if (error) {
        if (!isPersistentTransaction && req.t) {
            await req.t.rollback();
            delete req.t;
        }
    }

    return next(error);
};

module.exports = { middleware, errorware };
