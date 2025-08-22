const jwt = require("jsonwebtoken");

const SECRET_KEY = "your_secret_key_here"; // replace with env variable

// Create JWT token with role and isApproved
exports.createAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, isApproved: user.isApproved },
    SECRET_KEY
  );
};

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};

// ------------------ VERIFY ANY USER ------------------
exports.verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Invalid token" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // { id, role, isApproved }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

// ------------------ VERIFY ADMIN ONLY ------------------
exports.verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
