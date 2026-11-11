const crypto = require("crypto");

const {
  getOtpChallenge,
  saveOtpChallenge,
  updateOtpChallenge
} = require("../data/store");

const OTP_LENGTH = 6;
const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

function normalizeIdentifier(identifier) {
  return typeof identifier === "string" ? identifier.trim().toLowerCase() : "";
}

function hashCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function generateCode() {
  return crypto.randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH).toString();
}

async function createOtp(identifier) {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  if (!normalizedIdentifier) {
    const error = new Error("A valid identifier is required");
    error.status = 400;
    throw error;
  }

  const code = generateCode();
  const challenge = {
    identifier: normalizedIdentifier,
    codeHash: hashCode(code),
    expiresAt: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    attempts: 0,
    consumedAt: null
  };

  await saveOtpChallenge(challenge);

  return {
    identifier: normalizedIdentifier,
    expiresAt: challenge.expiresAt,
    code
  };
}

async function verifyOtp(identifier, code) {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const challenge = await getOtpChallenge(normalizedIdentifier);

  if (!challenge || challenge.consumedAt) {
    return { valid: false, reason: "OTP is invalid or has expired" };
  }

  if (new Date(challenge.expiresAt).getTime() <= Date.now()) {
    return { valid: false, reason: "OTP is invalid or has expired" };
  }

  if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
    return { valid: false, reason: "Too many OTP attempts" };
  }

  if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
    await updateOtpChallenge(normalizedIdentifier, {
      attempts: challenge.attempts + 1
    });
    return { valid: false, reason: "Invalid OTP" };
  }

  const expectedHash = Buffer.from(challenge.codeHash, "hex");
  const providedHash = Buffer.from(hashCode(code), "hex");
  const matches =
    expectedHash.length === providedHash.length &&
    crypto.timingSafeEqual(expectedHash, providedHash);

  if (!matches) {
    await updateOtpChallenge(normalizedIdentifier, {
      attempts: challenge.attempts + 1
    });
    return { valid: false, reason: "Invalid OTP" };
  }

  await updateOtpChallenge(normalizedIdentifier, {
    consumedAt: new Date().toISOString()
  });

  return { valid: true };
}

module.exports = {
  createOtp,
  verifyOtp,
  MAX_OTP_ATTEMPTS,
  OTP_TTL_MS
};
