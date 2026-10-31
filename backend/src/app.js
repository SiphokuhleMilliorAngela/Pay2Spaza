const express = require("express");
const cors = require("cors");

const {
  getMerchant,
  getMerchantTransactions,
  isConnected
} = require("./data/store");

const {
  seedMerchants,
  toApiMerchant
} = require("./data/merchants");

const {
  processTransactions
} = require("./services/transactionService");

const app = express();

seedMerchants().catch((error) => {
  console.error("Failed to seed development merchants", error);
});

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    success: true,
    data: {
      service: "pay2spaza-backend",
      status: "healthy",
      database: isConnected() ? "connected" : "in-memory"
    },
    error: null
  });
});

app.get("/api/merchants/:id", async (req, res, next) => {
  try {
    const merchant = await getMerchant(req.params.id.toUpperCase());

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
  } catch (error) {
    return next(error);
  }
});

app.get("/api/merchants/:id/transactions", async (req, res, next) => {
  try {
    const merchant = await getMerchant(req.params.id.toUpperCase());

    if (!merchant) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "Merchant not found"
      });
    }

    const transactions = await getMerchantTransactions(merchant.merchantId);

    return res.json({
      success: true,
      data: {
        merchant: toApiMerchant(merchant),
        transactions
      },
      error: null
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/transactions/sync", async (req, res, next) => {
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
