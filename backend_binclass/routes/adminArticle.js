const express = require("express");
const router = express.Router();
const db = require("../config/db");
const upload = require("../middleware/uploadMiddleware");
const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

/* =========================
   CREATE ARTIKEL (ADMIN)
========================= */
router.post(
  "/",
  verifyToken,
  isAdmin,
  upload.single("image"),
  (req, res) => {
    const {
      title,
      tags,
      deskripsi,
      icon,
      content,
      video_url,
      image_url,
      category
    } = req.body;

    const image_file = req.file ? req.file.filename : null;

    const sql = `
      INSERT INTO articles
      (title, tags, deskripsi, icon, content, video_url, image_url, image_file, category, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;

    db.query(
      sql,
      [
        title,
        tags,
        deskripsi,
        icon,
        content,
        video_url,
        image_url,
        image_file,
        category
      ],
      (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Artikel berhasil ditambahkan", id: result.insertId });
      }
    );
  }
);

/* =========================
   READ SEMUA ARTIKEL (ADMIN)
   ✅ FIX: HANYA AMBIL YANG AKTIF
========================= */
router.get("/", verifyToken, isAdmin, (req, res) => {
  const sql = `
    SELECT *
    FROM articles
    WHERE is_active = 1
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});


/* =========================
   READ DETAIL ARTIKEL (ADMIN)
   ✅ FIX: JANGAN TAMPILKAN YANG SUDAH SOFT DELETE
========================= */
router.get("/:id", verifyToken, isAdmin, (req, res) => {
  console.log("✅ HIT /api/admin/articles (adminArticle.js)"); 
  const sql = `
    SELECT *
    FROM articles
    WHERE id = ? AND COALESCE(is_active, 1) = 1
  `;

  db.query(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.status(404).json({ message: "Artikel tidak ditemukan" });
    res.json(rows[0]);
  });
});

/* =========================
   UPDATE ARTIKEL (ADMIN)
========================= */
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  upload.single("image"),
  (req, res) => {
    const {
      title,
      tags,
      deskripsi,
      icon,
      content,
      video_url,
      image_url,
      category,
      is_active
    } = req.body;

    const image_file = req.file ? req.file.filename : req.body.old_image;

    const sql = `
      UPDATE articles SET
        title = ?,
        tags = ?,
        deskripsi = ?,
        icon = ?,
        content = ?,
        video_url = ?,
        image_url = ?,
        image_file = ?,
        category = ?,
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `;

    db.query(
      sql,
      [
        title,
        tags,
        deskripsi,
        icon,
        content,
        video_url,
        image_url,
        image_file,
        category,
        is_active,
        req.params.id
      ],
      (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Artikel berhasil diperbarui" });
      }
    );
  }
);

/* =========================
   DELETE ARTIKEL (ADMIN)
   (SOFT DELETE)
========================= */
router.delete("/:id", verifyToken, isAdmin, (req, res) => {
  const sql = `
    UPDATE articles
    SET is_active = 0
    WHERE id = ?
  `;

  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Artikel berhasil dihapus (soft delete)" });
  });
});

module.exports = router;
