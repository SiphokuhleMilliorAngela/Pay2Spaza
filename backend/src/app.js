const express = require("express");
const cors = require("cors");
const {
  getMerchant,
  getMerchantTransactions,
  getTransaction,
  hasNonce,
  saveTransaction
} = require("./data/store");
const { seedDevelopmentMerchants } = require("./services/merchantService");

const app = express();
const requiredTransactionFields = [
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
  "publicKey",
  "status"
];
const idempotencyFields = requiredTransactionFields.filter((field) => field !== "status");

app.use(cors());
app.use(express.json());
seedDevelopmentMerchants();

function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    error: null
  });
}

function sendError(res, statusCode, error) {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error
  });
}

function isValidAmount(amount) {
  return Number.isFinite(amount) && amount > 0;
}

function isIdempotent(existingTransaction, incomingTransaction) {
  return idempotencyFields.every((field) => (
    existingTransaction[field] === incomingTransaction[field]
  ));
}

function reject(transactionId, reason) {
  return {
    transactionId,
    status: "REJECTED",
    reason
  };
}

function processTransaction(transaction, index) {
  const fallbackTransactionId = `UNKNOWN_${index + 1}`;

  if (!transaction || typeof transaction !== "object" || Array.isArray(transaction)) {
    return reject(fallbackTransactionId, "Invalid transaction payload");
  }

  const transactionId = typeof transaction.transactionId === "string" && transaction.transactionId.trim()
    ? transaction.transactionId
    : fallbackTransactionId;

  const existingTransaction = getTransaction(transaction.transactionId);
  if (existingTransaction) {
    if (isIdempotent(existingTransaction, transaction)) {
      return {
        transactionId,
        status: "CONFIRMED",
        reason: null
      };
    }

    return reject(transactionId, "Duplicate transaction ID");
  }

  const missingFields = requiredTransactionFields.filter((field) => {
    if (!(field in transaction)) {
      return true;
    }

    if (typeof transaction[field] === "string") {
      return transaction[field].trim().length === 0;
    }

    return transaction[field] === null || transaction[field] === undefined;
  });

  if (missingFields.length > 0) {
    return reject(transactionId, `Missing required fields: ${missingFields.join(", ")}`);
  }

  if (!isValidAmount(transaction.amount)) {
    return reject(transactionId, "Invalid transaction amount");
  }

  if (!getMerchant(transaction.merchantId)) {
    return reject(transactionId, "Unknown merchant");
  }

  if (hasNonce(transaction.nonce)) {
    return reject(transactionId, "Possible replay attack");
  }

  saveTransaction({
    ...transaction,
    status: "CONFIRMED"
  });

  return {
    transactionId,
    status: "CONFIRMED",
    reason: null
  };
}

app.get("/health", (req, res) => {
  return sendSuccess(res, {
    service: "pay2spaza-backend",
    status: "healthy"
  });
});

app.get("/api/merchants/:id", (req, res) => {
  const merchant = getMerchant(req.params.id);
  if (!merchant) {
    return sendError(res, 404, "Merchant not found");
  }

  return sendSuccess(res, {
    id: merchant.id,
    name: merchant.name,
    ownerFirstName: merchant.ownerFirstName
  });
});

app.get("/api/merchants/:id/transactions", (req, res) => {
  const merchant = getMerchant(req.params.id);
  if (!merchant) {
    return sendError(res, 404, "Merchant not found");
  }

  return sendSuccess(res, {
    transactions: getMerchantTransactions(req.params.id)
  });
});

app.post("/api/transactions/sync", (req, res) => {
  if (!req.body || !Array.isArray(req.body.transactions)) {
    return sendError(res, 400, "Invalid payload: transactions must be an array");
  }

  const results = req.body.transactions.map((transaction, index) => processTransaction(transaction, index));

  return sendSuccess(res, { results });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && error.body) {
    return sendError(res, 400, "Malformed JSON request");
  }

  return sendError(res, 500, "Internal server error");
});

app.use((req, res) => sendError(res, 404, "Route not found"));

module.exports = app;