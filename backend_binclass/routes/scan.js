const express = require('express');
const router = express.Router();
const multer = require('multer');
const scanController = require('../controllers/scanController');
const { verifyToken } = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuth');

// ===============================
// MULTER CONFIG
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, Date.now() + '.' + ext);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('File harus berupa gambar'), false);
  },
  limits: { fileSize: 2 * 1024 * 1024 }
});

console.log(scanController);


// ===============================
// USER ROUTES
// ===============================

// 1. Scan (login / anonim)
router.post('/', verifyToken, upload.single('image'), scanController.scanSampah);

// 2. Riwayat scan user
router.get('/my', verifyToken, scanController.getMyScans);

// 3. Detail scan user
router.get('/:id', verifyToken, scanController.getScanById);

// 4. Soft delete scan user
router.delete('/:id', verifyToken, scanController.softDeleteScan);

module.exports = router;
