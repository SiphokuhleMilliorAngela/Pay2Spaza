const {
  creditWallet,
  getWallet,
  saveWallet
} = require("../data/store");

function validAmount(amount) {
  return typeof amount === "number" && Number.isFinite(amount) && amount > 0;
}

async function createWallet(req, res, next) {
  try {
    const { customerId, balance = 0, currency = "ZAR" } = req.body || {};
    if (typeof customerId !== "string" || !customerId.trim()) {
      return res.status(400).json({ success: false, data: null, error: "customerId is required" });
    }
    if (!validAmount(balance) && balance !== 0) {
      return res.status(400).json({ success: false, data: null, error: "Invalid balance" });
    }
    if (currency !== "ZAR") {
      return res.status(400).json({ success: false, data: null, error: "Unsupported currency" });
    }

    const wallet = await saveWallet({ customerId: customerId.trim(), balance, currency });
    return res.status(201).json({ success: true, data: wallet, error: null });
  } catch (error) {
    return next(error);
  }
}

async function readWallet(req, res, next) {
  try {
    const wallet = await getWallet(req.params.customerId);
    if (!wallet) {
      return res.status(404).json({ success: false, data: null, error: "Wallet not found" });
    }
    return res.json({ success: true, data: wallet, error: null });
  } catch (error) {
    return next(error);
  }
}

async function topUpWallet(req, res, next) {
  try {
    const { amount } = req.body || {};
    if (!validAmount(amount)) {
      return res.status(400).json({ success: false, data: null, error: "Invalid amount" });
    }
    const wallet = await creditWallet(req.params.customerId, amount);
    if (!wallet) {
      return res.status(404).json({ success: false, data: null, error: "Wallet not found" });
    }
    return res.json({ success: true, data: wallet, error: null });
  } catch (error) {
    return next(error);
  }
}

module.exports = { createWallet, readWallet, topUpWallet };
