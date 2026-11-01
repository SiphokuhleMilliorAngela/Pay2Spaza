const { processTransactions } = require("../services/transactionService");

async function syncTransactions(req, res, next) {
  try {
    const { transactions } = req.body || {};
    const data = await processTransactions(transactions);

    return res.json({
      success: true,
      data,
      error: null
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  syncTransactions
};