const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth")); // login/register/logout/refresh-token

// ADMIN (artikels & kuis sudah pakai verifyToken+isAdmin di dalam file route kamu)
app.use("/api/admin/articles", require("./routes/adminArticle"));
app.use("/api/admin/kuis", require("./routes/adminKuis"));
app.use("/api/admin/scan", require("./routes/adminScan"));

// PUBLIC
app.use("/api/public/articles", require("./routes/publicArticle"));

// USER
app.use("/api/user/kuis", require("./routes/userKuis"));
app.use("/api/scan", require("./routes/scan"));

// lainnya (dashboard/test) tetap kalau kamu butuh
app.use("/api", require("./routes/admin"));
app.use("/api", require("./routes/test"));

// Default route
app.get("/", (req, res) => {
  res.json({ status: "Backend API running" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
