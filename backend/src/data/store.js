const { MongoClient } = require("mongodb");

const merchants = new Map();
const transactions = new Map();
const usedNonces = new Set();
let client;
let database;

async function connectStore(uri, databaseName = process.env.MONGODB_DATABASE || "pay2spaza") {
  if (!uri) {
    return false;
  }

  client = new MongoClient(uri);
  await client.connect();
  database = client.db(databaseName);
  await database.collection("merchants").createIndex({ merchantId: 1 }, { unique: true });
  await database.collection("transactions").createIndex({ transactionId: 1 }, { unique: true });
  await database.collection("transactions").createIndex({ nonce: 1 }, { unique: true });

  const storedMerchants = await database.collection("merchants").find({}).toArray();
  storedMerchants.forEach((merchant) => merchants.set(merchant.merchantId, merchant));

  const storedTransactions = await database.collection("transactions").find({}).toArray();
  storedTransactions.forEach((transaction) => {
    transactions.set(transaction.transactionId, transaction);
    usedNonces.add(transaction.nonce);
  });

  return true;
}

async function closeStore() {
  if (client) {
    await client.close();
    client = undefined;
    database = undefined;
  }
}

function isConnected() {
  return Boolean(database);
}

async function saveMerchant(merchant) {
  merchants.set(merchant.merchantId, merchant);
  if (database) {
    await database.collection("merchants").replaceOne(
      { merchantId: merchant.merchantId },
      merchant,
      { upsert: true }
    );
  }
  return merchant;
}

async function getMerchant(merchantId) {
  const cached = merchants.get(merchantId);
  if (cached || !database) {
    return cached;
  }

  const merchant = await database.collection("merchants").findOne({ merchantId });
  if (merchant) {
    merchants.set(merchantId, merchant);
  }
  return merchant;
}

async function saveTransaction(transaction) {
  transactions.set(transaction.transactionId, transaction);
  usedNonces.add(transaction.nonce);
  if (database) {
    await database.collection("transactions").insertOne(transaction);
  }
  return transaction;
}

async function getTransaction(transactionId) {
  const cached = transactions.get(transactionId);
  if (cached || !database) {
    return cached;
  }

  const transaction = await database.collection("transactions").findOne({ transactionId });
  if (transaction) {
    transactions.set(transactionId, transaction);
    usedNonces.add(transaction.nonce);
  }
  return transaction;
}

async function getMerchantTransactions(merchantId) {
  if (!database) {
    return Array.from(transactions.values()).filter(
      (transaction) => transaction.merchantId === merchantId
    );
  }

  return database.collection("transactions").find({ merchantId }).toArray();
}

function hasTransaction(transactionId) {
  return transactions.has(transactionId);
}

async function hasNonce(nonce) {
  if (usedNonces.has(nonce) || !database) {
    return usedNonces.has(nonce);
  }

  return Boolean(await database.collection("transactions").findOne({ nonce }));
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
  hasNonce,
  connectStore,
  closeStore,
  isConnected
};