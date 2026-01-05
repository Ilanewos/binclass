const jwt = require("jsonwebtoken");

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch {
    req.user = null;
  }

  next();
};

module.exports = optionalAuth;
