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

    // ✅ is_active DIPAKSA = 1
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
        res.json({
          message: "Artikel berhasil ditambahkan",
          id: result.insertId
        });
      }
    );
  }
);

/* =========================
   READ SEMUA ARTIKEL (ADMIN)
========================= */
router.get("/", verifyToken, isAdmin, (req, res) => {
  const sql = `
    SELECT *
    FROM articles
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

/* =========================
   READ DETAIL ARTIKEL (ADMIN)
========================= */
router.get("/:id", verifyToken, isAdmin, (req, res) => {
  const sql = `SELECT * FROM articles WHERE id = ?`;

  db.query(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length)
      return res.status(404).json({ message: "Artikel tidak ditemukan" });

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

    // ✅ is_active tidak boleh NULL
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
   (TIDAK DIUBAH – DELETE FISIK)
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
