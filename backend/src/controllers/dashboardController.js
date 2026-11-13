const {
  getAllTransactions,
  getCustomerTransactions,
  getMerchants,
  getWallet
} = require("../data/store");

function filterTransactions(transactions, query) {
  const { merchantId, customerId, from, to } = query;
  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;

  return transactions.filter((transaction) => {
    const createdAt = new Date(transaction.createdAt);
    return (!merchantId || transaction.merchantId === merchantId) &&
      (!customerId || transaction.customerId === customerId) &&
      (!fromDate || createdAt >= fromDate) &&
      (!toDate || createdAt <= toDate);
  });
}

async function listMerchants(req, res, next) {
  try {
    const merchants = await getMerchants();
    return res.json({
      success: true,
      data: merchants.map(({ merchantId, ...merchant }) => ({
        ...merchant,
        id: merchant.id || merchantId
      })),
      error: null
    });
  } catch (error) {
    return next(error);
  }
}

async function listTransactions(req, res, next) {
  try {
    const transactions = filterTransactions(await getAllTransactions(), req.query);
    return res.json({ success: true, data: { transactions }, error: null });
  } catch (error) {
    return next(error);
  }
}

async function listCustomerTransactions(req, res, next) {
  try {
    const transactions = await getCustomerTransactions(req.params.customerId);
    return res.json({
      success: true,
      data: { customerId: req.params.customerId, transactions },
      error: null
    });
  } catch (error) {
    return next(error);
  }
}

async function dashboardSummary(req, res, next) {
  try {
    const [transactions, merchants] = await Promise.all([
      getAllTransactions(),
      getMerchants()
    ]);
    const filtered = filterTransactions(transactions, req.query);
    const confirmed = filtered.filter((transaction) => transaction.status === "CONFIRMED");
    const summary = {
      merchantCount: merchants.length,
      transactionCount: filtered.length,
      confirmedCount: confirmed.length,
      rejectedCount: filtered.filter((transaction) => transaction.status === "REJECTED").length,
      totalAmount: confirmed.reduce((total, transaction) => total + transaction.amount, 0),
      currency: "ZAR"
    };

    if (req.query.customerId) {
      summary.wallet = await getWallet(req.query.customerId);
    }

    return res.json({ success: true, data: summary, error: null });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  dashboardSummary,
  listCustomerTransactions,
  listMerchants,
  listTransactions
};
