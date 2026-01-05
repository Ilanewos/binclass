const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const c = require("../controllers/kuisAdminController");

console.log("verifyToken:", typeof verifyToken);
console.log("isAdmin:", typeof isAdmin);
console.log("getSoalAllWithOpsi:", typeof c.getSoalAllWithOpsi);
console.log("getAllSoal:", typeof c.getAllSoal);



/* ================== SOAL ================== */
router.get("/soal", verifyToken, isAdmin, c.getSoalAllWithOpsi);
router.get("/soal", verifyToken, isAdmin, c.getAllSoal);
router.post("/soal", verifyToken, isAdmin, c.tambahSoal);
router.get("/soal/:id", verifyToken, isAdmin, c.getSoalById);
router.get("/:kuis_id/soal", verifyToken, isAdmin, c.getSoalByKuis);

router.put("/soal/:id", verifyToken, isAdmin, c.editSoal);
router.delete("/soal/:id", verifyToken, isAdmin, c.hapusSoal);



/* ================== KUIS ================== */
router.post("/", verifyToken, isAdmin, c.tambahKuis);
router.get("/", verifyToken, isAdmin, c.getAllKuis);
router.get("/:id", verifyToken, isAdmin, c.getKuisById);
router.delete("/:id", verifyToken, isAdmin, c.hapusKuis);


/* ================== OPSI ================== */
// OPSI
router.get("/opsi/:soal_id", verifyToken, isAdmin, c.getOpsiBySoal);
router.post("/opsi", verifyToken, isAdmin, c.tambahOpsi);
router.put("/opsi/:id", verifyToken, isAdmin, c.editOpsi);
router.delete("/opsi/:id", verifyToken, isAdmin, c.hapusOpsi);

module.exports = router;
