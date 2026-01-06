const db = require("../config/db");

// helper: pastikan id valid angka
function parseId(param) {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

// ===============================
// GET ALL SCANS (ONLY ACTIVE) - URUT SAMA KAYAK phpMyAdmin (id ASC)
// ===============================
exports.getAllScans = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        s.id,
        s.user_id,
        s.image_path,
        s.label,
        s.confidence,
        s.info,
        s.is_active,
        s.created_at,
        s.verified
      FROM scans s
      WHERE s.is_active = 1
      ORDER BY s.id ASC
    `);

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("ADMIN getAllScans error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// GET DETAIL SCAN
// ===============================
exports.getScanDetail = async (req, res) => {
  try {
    const scanId = parseId(req.params.id);
    if (!scanId) {
      return res.status(400).json({ success: false, message: "ID tidak valid" });
    }

    const [rows] = await db.promise().query(`SELECT * FROM scans WHERE id = ?`, [scanId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Scan tidak ditemukan" });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("ADMIN getScanDetail error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// ADMIN DELETE (SOFT DELETE)
// ===============================
exports.adminDeleteScan = async (req, res) => {
  try {
    const scanId = parseId(req.params.id);
    if (!scanId) {
      return res.status(400).json({ success: false, message: "ID tidak valid" });
    }

    const [result] = await db
      .promise()
      .query(`UPDATE scans SET is_active = 0 WHERE id = ? AND is_active = 1`, [scanId]);

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Scan tidak ditemukan / sudah terhapus",
      });
    }

    return res.json({ success: true, message: "Scan dihapus oleh admin", id: scanId });
  } catch (err) {
    console.error("ADMIN adminDeleteScan error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// RESTORE SCAN
// ===============================
exports.restoreScan = async (req, res) => {
  try {
    const scanId = parseId(req.params.id);
    if (!scanId) {
      return res.status(400).json({ success: false, message: "ID tidak valid" });
    }

    const [result] = await db
      .promise()
      .query(`UPDATE scans SET is_active = 1 WHERE id = ? AND is_active = 0`, [scanId]);

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Scan tidak ditemukan / sudah aktif",
      });
    }

    return res.json({ success: true, message: "Scan berhasil direstore", id: scanId });
  } catch (err) {
    console.error("ADMIN restoreScan error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// STATISTIK SCAN
// ===============================
exports.getScanStats = async (req, res) => {
  try {
    const [[total]] = await db.promise().query(`SELECT COUNT(*) total FROM scans`);

    const [labels] = await db.promise().query(`
      SELECT label, COUNT(*) jumlah
      FROM scans
      GROUP BY label
    `);

    return res.json({
      success: true,
      data: {
        total_scan: total.total,
        per_label: labels,
      },
    });
  } catch (err) {
    console.error("ADMIN getScanStats error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
