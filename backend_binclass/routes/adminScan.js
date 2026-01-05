const express = require("express");
const router = express.Router();
const adminScanController = require("../controllers/adminScanController");
const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

// Semua route admin wajib login + admin
router.use(verifyToken, isAdmin);

// 9. Statistik scan (HARUS sebelum /:id)
router.get("/stats/summary", adminScanController.getScanStats);

// 5. Semua scan
router.get("/", adminScanController.getAllScans);

// 6. Detail scan
router.get("/:id", adminScanController.getScanDetail);

// 7. Soft delete scan (admin)
router.delete("/:id", adminScanController.adminDeleteScan);

// 8. Restore scan
router.patch("/:id/restore", adminScanController.restoreScan);

module.exports = router;
