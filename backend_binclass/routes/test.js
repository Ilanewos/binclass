const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware"); // <--- ini

router.get("/test/user", verifyToken, (req, res) => {
  res.json({
    message: "Token valid",
    user: req.user
  });
});

module.exports = router;
