const express = require("express");
const cors = require("cors");

const {
  getMerchant,
  getMerchantTransactions
} = require("./data/store");

const {
  seedMerchants,
  toApiMerchant
} = require("./data/merchants");

const {
  processTransactions
} = require("./services/transactionService");

const app = express();

seedMerchants();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    success: true,
    data: {
      service: "pay2spaza-backend",
      status: "healthy"
    },
    error: null
  });
});

app.get("/api/merchants/:id", (req, res) => {
  const merchant = getMerchant(req.params.id.toUpperCase());

  if (!merchant) {
    return res.status(404).json({
      success: false,
      data: null,
      error: "Merchant not found"
    });
  }

  return res.json({
    success: true,
    data: toApiMerchant(merchant),
    error: null
  });
});

app.get("/api/merchants/:id/transactions", (req, res) => {
  const merchant = getMerchant(req.params.id.toUpperCase());

  if (!merchant) {
    return res.status(404).json({
      success: false,
      data: null,
      error: "Merchant not found"
    });
  }

  const transactions = getMerchantTransactions(merchant.merchantId);

  return res.json({
    success: true,
    data: {
      merchant: toApiMerchant(merchant),
      transactions
    },
    error: null
  });
});

app.post("/api/transactions/sync", (req, res) => {
  const { transactions } = req.body || {};
  const data = processTransactions(transactions);

  return res.json({
    success: true,
    data,
    error: null
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: "Route not found"
  });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && error.body) {
    return res.status(400).json({
      success: false,
      data: null,
      error: "Malformed JSON request"
    });
  }

  console.error(error);

  return res.status(500).json({
    success: false,
    data: null,
    error: "Internal server error"
  });
});

module.exports = app;
