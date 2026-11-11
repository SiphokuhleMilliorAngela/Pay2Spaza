const mongoose = require("mongoose");

const merchants = new Map();
const transactions = new Map();
const usedNonces = new Set();
const otpChallenges = new Map();

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

const otpChallengeSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, required: true, default: 0 },
    consumedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

otpChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Merchant = mongoose.models.Merchant || mongoose.model("Merchant", merchantSchema);
const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
const OtpChallenge =
  mongoose.models.OtpChallenge ||
  mongoose.model("OtpChallenge", otpChallengeSchema);

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

async function saveOtpChallenge(challenge) {
  otpChallenges.set(challenge.identifier, challenge);

  if (isConnected()) {
    return OtpChallenge.findOneAndUpdate(
      { identifier: challenge.identifier },
      challenge,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
  }

  return challenge;
}

async function getOtpChallenge(identifier) {
  if (isConnected()) {
    return OtpChallenge.findOne({ identifier }).lean();
  }

  return otpChallenges.get(identifier) || null;
}

async function updateOtpChallenge(identifier, updates) {
  const existing = otpChallenges.get(identifier);
  if (existing) {
    otpChallenges.set(identifier, { ...existing, ...updates });
  }

  if (isConnected()) {
    return OtpChallenge.findOneAndUpdate(
      { identifier },
      updates,
      { new: true }
    ).lean();
  }

  return otpChallenges.get(identifier) || null;
}

module.exports = {
  connectStore,
  getMerchant,
  getMerchantTransactions,
  getTransaction,
  hasNonce,
  isConnected,
  merchants,
  getOtpChallenge,
  saveMerchant,
  saveOtpChallenge,
  saveTransaction,
  transactions,
  updateOtpChallenge,
  otpChallenges,
  usedNonces,
};