const express = require("express");
const cors = require("cors");

const {
  getMerchant,
  isConnected
} = require("./data/store");

const {
  seedMerchants,
} = require("./data/merchants");

const {
  listMerchantTransactions,
  lookupMerchant
} = require("./controllers/merchantController");

const { syncTransactions } = require("./controllers/transactionController");
const { confirmOtp, requestOtp } = require("./controllers/otpController");
const {
  createWallet,
  readWallet,
  topUpWallet
} = require("./controllers/walletController");
const {
  dashboardSummary,
  listCustomerTransactions,
  listMerchants,
  listTransactions
} = require("./controllers/dashboardController");
const { login, signup } = require("./controllers/authController");
const { authenticate, requireRole } = require("./middleware/auth");

const app = express();

seedMerchants().catch((error) => {
  console.error("Failed to seed development merchants", error);
});

app.use(cors());
app.use(express.json());

app.post("/api/auth/otp/request", async (req, res, next) => {
  return requestOtp(req, res, next);
});

app.post("/api/auth/otp/verify", async (req, res, next) => {
  return confirmOtp(req, res, next);
});

app.post("/api/auth/signup", async (req, res, next) => {
  return signup(req, res, next);
});

app.post("/api/auth/login", async (req, res, next) => {
  return login(req, res, next);
});

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
  return lookupMerchant(req, res, next);
});

app.get("/api/merchants", authenticate, requireRole("admin"), async (req, res, next) => {
  return listMerchants(req, res, next);
});

app.get("/api/merchants/:id/transactions", async (req, res, next) => {
  return listMerchantTransactions(req, res, next);
});

app.get("/api/transactions", authenticate, requireRole("admin"), async (req, res, next) => {
  return listTransactions(req, res, next);
});

app.get("/api/transactions/customer/:customerId", authenticate, requireRole("admin"), async (req, res, next) => {
  return listCustomerTransactions(req, res, next);
});

app.get("/api/dashboard/summary", authenticate, requireRole("admin"), async (req, res, next) => {
  return dashboardSummary(req, res, next);
});

app.post("/api/transactions/sync", async (req, res, next) => {
  return syncTransactions(req, res, next);
});

app.post("/api/wallets", async (req, res, next) => {
  return createWallet(req, res, next);
});

app.get("/api/wallets/:customerId", async (req, res, next) => {
  return readWallet(req, res, next);
});

app.post("/api/wallets/:customerId/top-up", async (req, res, next) => {
  return topUpWallet(req, res, next);
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

  if (error.status === 400) {
    return res.status(400).json({
      success: false,
      data: null,
      error: error.message
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
