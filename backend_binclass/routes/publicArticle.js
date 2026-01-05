const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* =========================
   LIST ARTIKEL PUBLIK
========================= */
router.get("/", (req, res) => {
  const sql = `
    SELECT
      id,
      title,
      deskripsi,
      icon,
      tags,
      IF(image_file IS NOT NULL,
        CONCAT('/uploads/', image_file),
        image_url
      ) AS image,
      video_url,
      category,
      created_at
    FROM articles
    WHERE COALESCE(is_active, 1) = 1
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

/* =========================
   DETAIL ARTIKEL PUBLIK
========================= */
router.get("/:id", (req, res) => {
  const sql = `
    SELECT
      id,
      title,
      content,
      deskripsi,
      icon,
      tags,
      IF(image_file IS NOT NULL,
        CONCAT('/uploads/', image_file),
        image_url
      ) AS image,
      video_url,
      category,
      created_at
    FROM articles
    WHERE id = ? AND COALESCE(is_active, 1) = 1
  `;

  db.query(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length)
      return res.status(404).json({ message: "Artikel tidak ditemukan" });

    res.json(rows[0]);
  });
});

module.exports = router;
