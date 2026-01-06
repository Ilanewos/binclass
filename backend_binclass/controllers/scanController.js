const fs = require("fs");
const mlService = require("../services/mlService");
const db = require("../config/db");
const { getSampahInfo } = require("../services/sampahInfo");

/**
 * ===============================
 * SCAN SAMPAH (USER)
 * ===============================
 */
const scanSampah = async (req, res) => {
  try {
    // 1️⃣ Validasi login
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Login diperlukan untuk melakukan scan",
      });
    }

    // 2️⃣ Validasi file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Gambar tidak ditemukan",
      });
    }

    const userId = req.user.id;

    // 3️⃣ Kirim ke ML service
    const result = await mlService.predictSampah(req.file.path);
    // result = { label, confidence, info }



// tambahkan ini:
result.info = getSampahInfo(String(result.label || "").trim().toLowerCase());



    // 4️⃣ Simpan ke database
    const sql = `
      INSERT INTO scans (user_id, image_path, label, confidence, info)
      VALUES (?, ?, ?, ?, ?)
    `;

    await db.promise().query(sql, [
      userId,
      req.file.path,
      result.label,
      result.confidence,
      result.info,
    ]);

    // 5️⃣ Response API (FINAL & STABIL)
    return res.json({
      success: true,
      message: "Scan berhasil",
      data: result,
    });

  } catch (error) {
    console.error("❌ ERROR SCAN:", error.message);

    if (error.message === "ML_SERVICE_ERROR") {
      return res.status(502).json({
        success: false,
        message: "Layanan ML sedang tidak tersedia",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });

  } finally {
    // 6️⃣ Hapus file upload sementara
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
  }
};

/**
 * ===============================
 * RIWAYAT SCAN USER
 * ===============================
 */
const getMyScans = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.promise().query(
      `
      SELECT 
        id,
        image_path,
        label,
        confidence,
        info,
        created_at
      FROM scans
      WHERE user_id = ? AND is_active = 1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * ===============================
 * DETAIL SCAN USER
 * ===============================
 */
const getScanById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await db.promise().query(
      `
      SELECT *
      FROM scans
      WHERE id = ? AND user_id = ? AND is_active = 1
      `,
      [id, userId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Scan tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * ===============================
 * SOFT DELETE SCAN USER
 * ===============================
 */
const softDeleteScan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [result] = await db.promise().query(
      `
      UPDATE scans
      SET is_active = 0
      WHERE id = ? AND user_id = ?
      `,
      [id, userId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Scan tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message: "Scan berhasil dihapus",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  scanSampah,
  getMyScans,
  getScanById,
  softDeleteScan,
};
