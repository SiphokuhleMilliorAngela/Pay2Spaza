const { createOtp, verifyOtp } = require("../services/otpService");

async function requestOtp(req, res, next) {
  try {
    const { identifier } = req.body || {};
    const otp = await createOtp(identifier);

    const response = {
      identifier: otp.identifier,
      expiresAt: otp.expiresAt
    };

    // A real SMS/email provider should deliver the code in production.
    if (process.env.NODE_ENV !== "production") {
      response.otp = otp.code;
    }

    return res.status(201).json({
      success: true,
      data: response,
      error: null
    });
  } catch (error) {
    return next(error);
  }
}

async function confirmOtp(req, res, next) {
  try {
    const { identifier, code } = req.body || {};
    const result = await verifyOtp(identifier, code);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        data: null,
        error: result.reason
      });
    }

    return res.json({
      success: true,
      data: { verified: true },
      error: null
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  confirmOtp,
  requestOtp
};
