const {
  getMerchant,
  getMerchantTransactions
} = require("../data/store");

const { toApiMerchant } = require("../data/merchants");

async function lookupMerchant(req, res, next) {
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
}

async function listMerchantTransactions(req, res, next) {
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
}

module.exports = {
  listMerchantTransactions,
  lookupMerchant
};