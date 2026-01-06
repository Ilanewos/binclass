const express = require("express");
const router = express.Router();
const adminScanController = require("../controllers/adminScanController");
const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

// Semua route admin wajib login + admin
router.use(verifyToken, isAdmin);

// Statistik scan (HARUS sebelum /:id)
router.get("/stats/summary", adminScanController.getScanStats);

// Semua scan (ONLY ACTIVE)
router.get("/", adminScanController.getAllScans);

// Detail scan
router.get("/:id", adminScanController.getScanDetail);

// Soft delete scan (admin)
router.delete("/:id", adminScanController.adminDeleteScan);

// Restore scan
router.patch("/:id/restore", adminScanController.restoreScan);

module.exports = router;
