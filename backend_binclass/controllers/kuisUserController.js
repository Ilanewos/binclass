// controllers/kuisUserController.js
const db = require("../config/db");

/* ================== LIST KUIS AKTIF (USER) ================== */
exports.getKuisAktif = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT id, judul FROM kuis WHERE is_active=1 ORDER BY created_at DESC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/* ================== MULAI KUIS ================== */
exports.mulaiKuis = async (req, res) => {
  const userId = req.user.id;
  const kuisId = req.params.kuis_id;

  try {
    // cek kuis aktif
    const [k] = await db
      .promise()
      .query("SELECT id FROM kuis WHERE id=? AND is_active=1", [kuisId]);
    if (!k.length) return res.status(404).json({ message: "Kuis tidak ditemukan" });

    // buat sesi
    const [ins] = await db
      .promise()
      .query("INSERT INTO kuis_sesi (user_id, kuis_id, skor, selesai) VALUES (?,?,0,0)", [
        userId,
        kuisId,
      ]);
    const sesiId = ins.insertId;

    // ambil soal random + opsi
    const [rows] = await db.promise().query(
      `
      SELECT s.id soal_id, s.pertanyaan, s.image_url,
             o.id opsi_id, o.teks_opsi
      FROM kuis_soal s
      JOIN kuis_opsi o ON s.id=o.soal_id
      WHERE s.kuis_id=? AND s.is_active=1
      ORDER BY RAND()
      LIMIT 40
      `,
      [kuisId]
    );

    const map = {};
    rows.forEach((r) => {
      if (!map[r.soal_id]) {
        map[r.soal_id] = {
          soal_id: r.soal_id,
          pertanyaan: r.pertanyaan,
          image_url: r.image_url,
          opsi: [],
        };
      }
      map[r.soal_id].opsi.push({
        id: r.opsi_id,
        teks: r.teks_opsi,
      });
    });

    const soal = Object.values(map).slice(0, 10).map((s) => ({
      ...s,
      opsi: (s.opsi || []).slice(0, 4),
    }));

    res.json({ sesi_id: sesiId, soal });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ================== JAWAB SOAL ================== */
// body: { sesi_id, soal_id, opsi_id }
/* ================== JAWAB SOAL ================== */
// body: { sesi_id, soal_id, opsi_id }
exports.jawabSoal = async (req, res) => {
  const userId = req.user.id;
  const { sesi_id, soal_id, opsi_id } = req.body;

  try {
    if (!sesi_id || !soal_id || !opsi_id) {
      return res.status(400).json({ message: "sesi_id, soal_id, opsi_id wajib" });
    }

    // pastikan sesi milik user & belum selesai
    const [sesiRows] = await db
      .promise()
      .query("SELECT id, selesai FROM kuis_sesi WHERE id=? AND user_id=?", [sesi_id, userId]);

    if (!sesiRows.length) return res.status(404).json({ message: "Sesi tidak ditemukan" });
    if (Number(sesiRows[0].selesai) === 1)
      return res.status(400).json({ message: "Sesi sudah selesai" });

    // pastikan opsi_id memang milik soal_id tsb + ambil benar/salah
    const [cek] = await db.promise().query(
      `
      SELECT id, benar
      FROM kuis_opsi
      WHERE id=? AND soal_id=?
      `,
      [opsi_id, soal_id]
    );

    if (!cek.length) {
      return res.status(400).json({ message: "opsi_id tidak cocok dengan soal_id" });
    }

    const benar = Number(cek[0].benar) === 1;

    // ambil correct opsi id untuk feedback (optional)
    const [correctRows] = await db.promise().query(
      `
      SELECT id
      FROM kuis_opsi
      WHERE soal_id=? AND benar=1
      LIMIT 1
      `,
      [soal_id]
    );
    const correct_opsi_id = correctRows.length ? correctRows[0].id : null;

    // simpan jawaban (upsert, unique sesi_id+soal_id)
    await db.promise().query(
      `
      INSERT INTO kuis_jawaban_user (sesi_id, soal_id, opsi_id, benar)
      VALUES (?,?,?,?)
      ON DUPLICATE KEY UPDATE opsi_id=VALUES(opsi_id), benar=VALUES(benar)
      `,
      [sesi_id, soal_id, opsi_id, benar ? 1 : 0]
    );

    res.json({
      success: true,
      benar,
      correct_opsi_id,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


/* ================== SELESAI KUIS ================== */
/* ================== SELESAI KUIS ================== */
exports.selesaiKuis = async (req, res) => {
  const userId = req.user.id;
  const sesiId = req.params.sesi_id;

  try {
    // pastikan sesi milik user
    const [sesiRows] = await db.promise().query(
      "SELECT id, selesai FROM kuis_sesi WHERE id=? AND user_id=?",
      [sesiId, userId]
    );

    if (!sesiRows.length) return res.status(404).json({ message: "Sesi tidak ditemukan" });

    // hitung skor (total benar) berdasarkan sesi_id
    const [[sum]] = await db.promise().query(
      `
      SELECT COUNT(*) total_benar
      FROM kuis_jawaban_user
      WHERE sesi_id=? AND benar=1
      `,
      [sesiId]
    );

    const skor = Number(sum?.total_benar || 0);

    await db.promise().query(
      `
      UPDATE kuis_sesi
      SET skor=?, selesai=1
      WHERE id=? AND user_id=?
      `,
      [skor, sesiId, userId]
    );

    res.json({ success: true, skor });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ================== RIWAYAT KUIS ================== */
exports.riwayatKuis = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.promise().query(
      `
      SELECT 
        ks.id sesi_id,
        ks.kuis_id,
        k.judul,
        ks.skor,
        ks.selesai,
        ks.created_at
      FROM kuis_sesi ks
      JOIN kuis k ON k.id = ks.kuis_id
      WHERE ks.user_id=?
      ORDER BY ks.created_at DESC
      `,
      [userId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
