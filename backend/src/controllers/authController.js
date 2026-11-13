const crypto = require("crypto");
const { users, sessions } = require("../data/store");

const VALID_ROLES = new Set(["customer", "merchant", "admin"]);

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    role: user.role
  };
}

function normalizeName(name) {
  return typeof name === "string" ? name.trim().toLowerCase() : "";
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) return reject(error);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

async function passwordMatches(password, storedHash) {
  const [salt, expectedHex] = storedHash.split(":");
  const actual = await hashPassword(password, salt);
  const expected = Buffer.from(expectedHex, "hex");
  const received = Buffer.from(actual.split(":")[1], "hex");
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

function issueToken(user) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, user.id);
  return token;
}

function validateCredentials(name, password, role) {
  if (!name || name.length < 2) return "Name must be at least 2 characters";
  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (!VALID_ROLES.has(role)) return "Role must be customer or merchant";
  return null;
}

async function signup(req, res, next) {
  try {
    const { name, password, role = "customer" } = req.body || {};
    const normalizedName = normalizeName(name);
    const validationError = validateCredentials(normalizedName, password, role);
    if (validationError) {
      return res.status(400).json({ success: false, data: null, error: validationError });
    }
    if (users.has(normalizedName)) {
      return res.status(409).json({ success: false, data: null, error: "Name is already registered" });
    }

    const user = {
      id: `USR-${crypto.randomBytes(8).toString("hex")}`,
      name: normalizedName,
      role,
      passwordHash: await hashPassword(password)
    };
    users.set(normalizedName, user);

    return res.status(201).json({
      success: true,
      data: { token: issueToken(user), user: publicUser(user) },
      error: null
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { name, password } = req.body || {};
    const user = users.get(normalizeName(name));
    if (!user || typeof password !== "string" || !(await passwordMatches(password, user.passwordHash))) {
      return res.status(401).json({ success: false, data: null, error: "Invalid name or password" });
    }

    return res.json({
      success: true,
      data: { token: issueToken(user), user: publicUser(user) },
      error: null
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { login, signup };
