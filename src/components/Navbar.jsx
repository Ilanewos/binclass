import { useState } from "react";
import { motion } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/logo.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ⛔ Jangan tampil di admin
  if (location.pathname.startsWith("/admin")) return null;

  const navItems = [
    { name: "Home", icon: "🏠", link: "/home" },
    { name: "Kuis", icon: "🎮", link: "/quiz-start" },
    { name: "Klasifikasi", icon: "📦", link: "/klasifikasi" },
    { name: "Artikel", icon: "📝", link: "/artikel" },
  ];

  const handleNavigate = (link) => {
    navigate(link);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("binclass_auth");
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full bg-green-600 py-4 px-6 fixed top-0 z-50 shadow-lg"
    >
      <div className="flex justify-between items-center">
        {/* LOGO */}
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/home")}
        >
          <img src={Logo} alt="logo" className="h-10" />
          <h1 className="text-white text-2xl font-bold">BINCLASS</h1>
        </motion.div>

        {/* DESKTOP */}
        <div className="hidden md:flex gap-3">
          {navItems.map((item) => (
            <motion.button
              key={item.name}
              onClick={() => handleNavigate(item.link)}
              className="bg-green-700 px-4 py-2 rounded-xl text-white font-semibold"
              whileHover={{ scale: 1.1 }}
            >
              {item.icon} {item.name}
            </motion.button>
          ))}

          <motion.button
            onClick={handleLogout}
            className="bg-red-600 px-4 py-2 rounded-xl text-white font-semibold"
            whileHover={{ scale: 1.1 }}
          >
            ❌ Keluar
          </motion.button>
        </div>

        {/* MOBILE */}
        <button
          className="md:hidden text-white text-3xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mt-4 bg-green-600 px-6 py-4 rounded-xl flex flex-col gap-4"
        >
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigate(item.link)}
              className="text-white text-lg"
            >
              {item.icon} {item.name}
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="text-red-300 text-lg"
          >
            ❌ Keluar
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
}
