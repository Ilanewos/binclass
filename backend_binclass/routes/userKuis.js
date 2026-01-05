const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const c = require("../controllers/kuisUserController");

router.get("/aktif", verifyToken, c.getKuisAktif);
router.post("/mulai/:kuis_id", verifyToken, c.mulaiKuis);
router.post("/jawab", verifyToken, c.jawabSoal);
router.post("/selesai/:sesi_id", verifyToken, c.selesaiKuis);
router.get("/riwayat", verifyToken, c.riwayatKuis);



module.exports = router;
