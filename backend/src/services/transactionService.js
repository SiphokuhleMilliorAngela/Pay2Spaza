const {
  getMerchant,
  saveTransaction,
  getTransaction,
  hasNonce
} = require("../data/store");

const MAX_OFFLINE_AMOUNT = 200;
const MAX_OFFLINE_TRANSACTIONS = 5;

const REQUIRED_FIELDS = [
  "transactionId",
  "merchantId",
  "customerId",
  "deviceId",
  "amount",
  "currency",
  "channel",
  "nonce",
  "offline",
  "createdAt",
  "signature",
  "publicKey"
];

function rejected(transaction, reason) {
  return {
    transactionId: transaction?.transactionId || null,
    status: "REJECTED",
    reason
  };
}

function confirmed(transaction) {
  return {
    transactionId: transaction.transactionId,
    status: "CONFIRMED",
    reason: null
  };
}

async function validateTransaction(transaction, offlineCount) {
  if (!transaction || typeof transaction !== "object") {
    return "Invalid transaction";
  }

  for (const field of REQUIRED_FIELDS) {
    if (
      transaction[field] === undefined ||
      transaction[field] === null ||
      transaction[field] === ""
    ) {
      return `Missing required field: ${field}`;
    }
  }

  if (typeof transaction.transactionId !== "string") {
    return "Invalid transaction ID";
  }

  if (typeof transaction.merchantId !== "string") {
    return "Invalid merchant ID";
  }

  if (typeof transaction.nonce !== "string") {
    return "Invalid nonce";
  }

  if (
    typeof transaction.amount !== "number" ||
    !Number.isFinite(transaction.amount) ||
    transaction.amount <= 0
  ) {
    return "Invalid amount";
  }

  if (transaction.currency !== "ZAR") {
    return "Unsupported currency";
  }

  if (transaction.channel !== "QR") {
    return "Unsupported payment channel";
  }

  if (typeof transaction.offline !== "boolean") {
    return "Invalid offline flag";
  }

  if (transaction.offline && transaction.amount > MAX_OFFLINE_AMOUNT) {
    return `Offline amount cannot exceed R${MAX_OFFLINE_AMOUNT}`;
  }

  if (transaction.offline && offlineCount >= MAX_OFFLINE_TRANSACTIONS) {
    return `Offline transaction limit of ${MAX_OFFLINE_TRANSACTIONS} reached`;
  }

  if (!(await getMerchant(transaction.merchantId))) {
    return "Merchant not found";
  }

  return null;
}

async function processTransactions(transactions) {
  if (!Array.isArray(transactions)) {
    return {
      results: [
        rejected(null, "transactions must be an array")
      ]
    };
  }

  const results = [];
  let offlineCount = 0;

  for (const transaction of transactions) {
    const existing = transaction?.transactionId
      ? await getTransaction(transaction.transactionId)
      : null;

    // Idempotent retry: return the original result for a known transaction.
    if (existing) {
      results.push({
        transactionId: existing.transactionId,
        status: existing.status === "REJECTED" ? "REJECTED" : "CONFIRMED",
        reason: existing.reason || null
      });
      continue;
    }

    const validationError = await validateTransaction(transaction, offlineCount);

    if (validationError) {
      results.push(rejected(transaction, validationError));
      continue;
    }

    if (await hasNonce(transaction.nonce)) {
      results.push(rejected(transaction, "Possible replay attack"));
      continue;
    }

    if (transaction.offline) {
      offlineCount += 1;
    }

    const storedTransaction = {
      ...transaction,
      status: "CONFIRMED",
      syncedAt: new Date().toISOString()
    };

    await saveTransaction(storedTransaction);
    results.push(confirmed(storedTransaction));
  }

  return { results };
}

module.exports = {
  processTransactions,
  MAX_OFFLINE_AMOUNT,
  MAX_OFFLINE_TRANSACTIONS
};
