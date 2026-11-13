const { sessions, users } = require("../data/store");

function authenticate(req, res, next) {
  const authorization = req.get("Authorization") || "";
  const [scheme, token] = authorization.split(" ");
  const userId = scheme === "Bearer" && token ? sessions.get(token) : null;
  const user = userId
    ? [...users.values()].find((candidate) => candidate.id === userId)
    : null;

  if (!user) {
    return res.status(401).json({
      success: false,
      data: null,
      error: "Authentication required"
    });
  }

  req.user = user;
  return next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        error: "Insufficient permissions"
      });
    }
    return next();
  };
}

module.exports = { authenticate, requireRole };
