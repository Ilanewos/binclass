import { useState } from "react";
import { motion } from "framer-motion";
import Logo from "../assets/logo.png";
import axios from "axios";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!username.trim() || !password.trim()) {
      const msg = "Username/email dan password wajib diisi";
      setError(msg);
      toast.error("Lengkapi datanya dulu ya 🙂");
      return;
    }

    let toastId;
    try {
      setLoading(true);
      toastId = toast.loading("Sedang masuk...");

      const res = await axios.post("http://localhost:5000/api/auth/login", {
        identifier: username.trim(),
        password,
      });

      const { accessToken, refreshToken, role, user_type } = res.data || {};

      if (!accessToken) {
        const msg = "Login sukses tapi accessToken tidak dikirim backend.";
        setError(msg);
        toast.error(msg, { id: toastId });
        return;
      }

      localStorage.setItem(
        "binclass_auth",
        JSON.stringify({ accessToken, refreshToken, role, user_type })
      );

      // ✅ opsional: flag untuk animasi di Home (kalau mau)
      sessionStorage.setItem("just_logged_in", "1");

      toast.success("Login berhasil! 🎉", { id: toastId });

      // ✅ bikin transisi lebih halus (tahan sebentar sebelum redirect)
      const target = role === "admin" ? "/admin" : "/home";
      await new Promise((r) => setTimeout(r, 450));

      window.location.href = target;
    } catch (err) {
      const msg = err?.response?.data?.message || "Login gagal";
      setError(msg);
      if (toastId) toast.error(msg, { id: toastId });
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-transparent px-4 overflow-hidden">
      {/* ✅ TAMBAHAN: OVERLAY GAMBAR */}
      <img
        src="/bgbinclas.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center opacity-35 pointer-events-none"
        style={{ mixBlendMode: "multiply" }}
      />

      {/* ✅ TAMBAHAN: OVERLAY WARNA */}
      <div className="absolute inset-0 bg-purple-900/25 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 bg-white w-full max-w-md rounded-3xl shadow-xl p-10 text-center"
      >
        {/* LOGO */}
        <motion.img
          src={Logo}
          className="w-32 mx-auto mb-4"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        />

        <h2 className="text-2xl font-bold text-green-600">Selamat Datang!</h2>
        <p className="text-gray-600 text-sm mb-6">
          Login untuk mulai belajar sampah
        </p>

        {error && (
          <div className="mb-4 text-left rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* USERNAME */}
        <div className="text-left mb-4">
          <label className="font-semibold text-sm">Email atau Username</label>
          <input
            type="text"
            placeholder="Masukan email atau username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* PASSWORD */}
        <div className="text-left mb-6 relative">
          <label className="font-semibold text-sm">Password</label>
          <input
            type={showPass ? "text" : "password"}
            placeholder="Masukan Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-400"
          />
          <span
            onClick={() => !loading && setShowPass(!showPass)}
            className="absolute right-3 top-[38px] cursor-pointer text-gray-500"
          >
            {showPass ? "👁️" : "🙈"}
          </span>
        </div>

        {/* BUTTON */}
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
          disabled={loading}
          onClick={handleLogin}
          className={`w-full text-white font-bold text-lg py-3 rounded-xl shadow-md ${
            loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600"
          }`}
        >
          {loading ? "Login..." : "Login 🚀"}
        </motion.button>

        <p className="mt-4 text-sm text-gray-700">
          Belum punya akun?{" "}
          <a href="/register" className="text-green-600 font-semibold">
            Daftar Disini
          </a>
        </p>
      </motion.div>
    </div>
  );
}
