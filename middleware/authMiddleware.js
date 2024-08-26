const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ status: 401, message: "Akses ditolak. Token tidak tersedia." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ status: 403, message: "Token tidak valid." });
    }
    req.user = decoded; // decoded akan memiliki id, role, dll dari jwt.sign()
    next();
  });
};

// Middleware untuk memverifikasi apakah pengguna adalah Admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ status: 403, message: "Akses ditolak. Anda bukan admin." });
  }
  next();
};

// Middleware untuk memverifikasi apakah pengguna adalah User
const isUser = (req, res, next) => {
  if (req.user.role !== "user") {
    return res
      .status(403)
      .json({ status: 403, message: "Akses ditolak. Anda bukan user." });
  }
  next();
};

module.exports = {
  authenticateToken,
  isAdmin,
  isUser,
};
