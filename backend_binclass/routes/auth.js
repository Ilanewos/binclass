const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, user_type } = req.body;

    if (!username || !password || !user_type) {
      return res.status(400).json({ message: "Data wajib diisi" });
    }

    if (!["child", "adult"].includes(user_type)) {
      return res.status(400).json({ message: "user_type tidak valid" });
    }

    if (user_type === "adult" && !email) {
      return res.status(400).json({ message: "Email wajib untuk dewasa" });
    }

    if (user_type === "child" && email) {
      return res.status(400).json({ message: "Akun anak tidak pakai email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (username, email, password, role, user_type, is_active)
      VALUES (?, ?, ?, 'user', ?, 1)
    `;

    db.query(sql, [username, email || null, hashedPassword, user_type], (err) => {
      if (err) {
        return res.status(400).json({ message: "Username/email sudah digunakan" });
      }
      res.status(201).json({ message: "Registrasi berhasil" });
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ message: "Data wajib diisi" });
  }

  const sql = `SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1`;
  db.query(sql, [identifier, identifier], async (err, result) => {
    if (err || result.length === 0) {
      return res.status(400).json({ message: "User tidak ditemukan" });
    }

    const user = result[0];
    if (user.is_active === 0) {
      return res.status(403).json({ message: "Akun tidak aktif" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Password salah" });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    db.query(
      "UPDATE users SET refresh_token = ?, last_login = NOW() WHERE id = ?",
      [refreshToken, user.id]
    );

    res.json({
      accessToken,
      refreshToken,
      role: user.role,
      user_type: user.user_type
    });
  });
});

/* ================= LOGOUT (GLOBAL) ================= */
router.post("/logout", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token wajib" });
  }

  db.query(
    "UPDATE users SET refresh_token = NULL WHERE refresh_token = ?",
    [refreshToken],
    () => res.json({ message: "Logout berhasil" })
  );
});

/* ================= REFRESH TOKEN ================= */
router.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(401);

  db.query(
    "SELECT * FROM users WHERE refresh_token = ?",
    [refreshToken],
    (err, result) => {
      if (err || result.length === 0) return res.sendStatus(403);

      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err || decoded.id !== result[0].id) return res.sendStatus(403);

        const newAccessToken = jwt.sign(
          { id: decoded.id, role: result[0].role },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" }
        );

        const newRefreshToken = jwt.sign(
          { id: decoded.id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "7d" }
        );

        db.query(
          "UPDATE users SET refresh_token = ? WHERE id = ?",
          [newRefreshToken, decoded.id]
        );

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
      });
    }
  );
});

module.exports = router;
