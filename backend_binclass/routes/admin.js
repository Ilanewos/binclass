const express = require("express");
const router = express.Router();

router.get("/dashboard", (req, res) => {
  res.json({
    message: "Selamat datang Admin",
    admin: { id: req.user.id, role: req.user.role }
  });
});

module.exports = router;
