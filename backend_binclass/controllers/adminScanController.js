const db = require("../config/db");

// ===============================
// GET ALL SCANS (ONLY ACTIVE)
// ===============================
exports.getAllScans = async (req, res) => {
  try {
    const [rows] = await db
      .promise()
      .query(`SELECT * FROM scans WHERE is_active = 1 ORDER BY created_at DESC`);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("ADMIN getAllScans error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// GET DETAIL SCAN
// ===============================
exports.getScanDetail = async (req, res) => {
  try {
    const scanId = req.params.id;
    const [rows] = await db
      .promise()
      .query(`SELECT * FROM scans WHERE id = ?`, [scanId]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Scan tidak ditemukan" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("ADMIN getScanDetail error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// ADMIN DELETE (SOFT DELETE)
// ===============================
exports.adminDeleteScan = async (req, res) => {
  try {
    const scanId = req.params.id;

    const [result] = await db
      .promise()
      .query(`UPDATE scans SET is_active = 0 WHERE id = ?`, [scanId]);

    if (!result.affectedRows) {
      return res
        .status(404)
        .json({ success: false, message: "Scan tidak ditemukan" });
    }

    res.json({ success: true, message: "Scan dihapus oleh admin" });
  } catch (err) {
    console.error("ADMIN adminDeleteScan error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// RESTORE SCAN (kalau kamu tetap mau endpoint ini ada)
// ===============================
exports.restoreScan = async (req, res) => {
  try {
    const scanId = req.params.id;

    const [result] = await db
      .promise()
      .query(`UPDATE scans SET is_active = 1 WHERE id = ?`, [scanId]);

    if (!result.affectedRows) {
      return res
        .status(404)
        .json({ success: false, message: "Scan tidak ditemukan" });
    }

    res.json({ success: true, message: "Scan berhasil direstore" });
  } catch (err) {
    console.error("ADMIN restoreScan error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// STATISTIK SCAN
// ===============================
exports.getScanStats = async (req, res) => {
  try {
    const [[total]] = await db.promise().query(`SELECT COUNT(*) total FROM scans`);

    const [labels] = await db
      .promise()
      .query(`SELECT label, COUNT(*) jumlah FROM scans GROUP BY label`);

    res.json({
      success: true,
      data: {
        total_scan: total.total,
        per_label: labels,
      },
    });
  } catch (err) {
    console.error("ADMIN getScanStats error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
