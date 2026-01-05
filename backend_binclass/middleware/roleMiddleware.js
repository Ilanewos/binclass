const isAdmin = (req, res, next) => {
  // ✅ Guard biar tidak error kalau req.user undefined
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Akses admin ditolak" });
  }
  next();
};

module.exports = { isAdmin };
