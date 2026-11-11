const mongoose = require("mongoose");

const merchants = new Map();
const transactions = new Map();
const usedNonces = new Set();

const merchantSchema = new mongoose.Schema(
  {
    merchantId: { type: String, required: true, unique: true },
    id: String,
    name: String,
    ownerFirstName: String
  },
  { timestamps: true }
);

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    merchantId: { type: String, required: true },
    nonce: { type: String, required: true, unique: true }
  },
  { strict: false, timestamps: true }
);

const Merchant = mongoose.models.Merchant || mongoose.model("Merchant", merchantSchema);
const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);

async function connectStore(uri, databaseName) {
  try {
    await mongoose.connect(uri, databaseName ? { dbName: databaseName } : undefined);

    console.log("MongoDB connection established");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}

function isConnected() {
  return mongoose.connection.readyState === 1;
}

async function saveMerchant(merchant) {
  const merchantId = merchant.merchantId || merchant.id;
  merchants.set(merchantId, { ...merchant, merchantId });

  if (isConnected()) {
    return Merchant.findOneAndUpdate(
      { merchantId },
      { ...merchant, merchantId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
  }

  return merchants.get(merchantId);
}

async function getMerchant(merchantId) {
  if (isConnected()) {
    return Merchant.findOne({
      $or: [{ merchantId }, { id: merchantId }]
    }).lean();
  }

  return merchants.get(merchantId) || null;
}

async function saveTransaction(transaction) {
  transactions.set(transaction.transactionId, transaction);
  usedNonces.add(transaction.nonce);

  if (isConnected()) {
    return Transaction.findOneAndUpdate(
      { transactionId: transaction.transactionId },
      transaction,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
  }

  return transaction;
}

async function getTransaction(transactionId) {
  if (isConnected()) {
    return Transaction.findOne({ transactionId }).lean();
  }

  return transactions.get(transactionId) || null;
}

async function hasNonce(nonce) {
  if (isConnected()) {
    return Boolean(await Transaction.exists({ nonce }));
  }

  return usedNonces.has(nonce);
}

async function getMerchantTransactions(merchantId) {
  if (isConnected()) {
    return Transaction.find({ merchantId }).sort({ createdAt: -1 }).lean();
  }

  return [...transactions.values()].filter(
    (transaction) => transaction.merchantId === merchantId
  );
}

module.exports = {
  connectStore,
  getMerchant,
  getMerchantTransactions,
  getTransaction,
  hasNonce,
  isConnected,
  merchants,
  saveMerchant,
  saveTransaction,
  transactions,
  usedNonces,
};