const merchants = new Map();
const transactions = new Map();
const usedNonces = new Set();

function saveMerchant(merchant) {
  merchants.set(merchant.merchantId, merchant);
  return merchant;
}

function getMerchant(merchantId) {
  return merchants.get(merchantId);
}

function saveTransaction(transaction) {
  transactions.set(transaction.transactionId, transaction);
  usedNonces.add(transaction.nonce);
  return transaction;
}

function getTransaction(transactionId) {
  return transactions.get(transactionId);
}

function getMerchantTransactions(merchantId) {
  return Array.from(transactions.values()).filter(
    (transaction) => transaction.merchantId === merchantId
  );
}

function hasTransaction(transactionId) {
  return transactions.has(transactionId);
}

function hasNonce(nonce) {
  return usedNonces.has(nonce);
}

module.exports = {
  merchants,
  transactions,
  usedNonces,
  saveMerchant,
  getMerchant,
  saveTransaction,
  getTransaction,
  getMerchantTransactions,
  hasTransaction,
  hasNonce
};