import React from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import HasilKuisImg from "../assets/hasilkuis.png"; // sesuaikan path

export default function QuizResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Ambil data score & totalQuestions dari state router
  const { score, totalQuestions } = location.state || {
    score: 0,
    totalQuestions: 10,
  };

  // Algoritma piala
  let trophy = 1;
  if (score >= 6 && score <= 9) trophy = 2;
  else if (score === 10) trophy = 3;

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen pt-16 bg-transparent p-4 overflow-hidden">
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
        className="relative z-10 bg-white p-8 md:p-12 rounded-2xl shadow-2xl max-w-lg w-full text-center"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-gray-800">
          Selamat Kuis Selesai!
        </h2>

        {/* Gambar Hasil Kuis */}
        <div className="mb-8 flex justify-center items-center">
          <img
            src={HasilKuisImg}
            alt="Hasil Kuis"
            className="w-64 md:w-80 object-contain"
          />
        </div>

        {/* Skor */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Skor Kamu: {score}/{totalQuestions}
          </h1>
          <div className="text-5xl mt-4">
            {Array.from({ length: trophy }).map((_, idx) => (
              <span key={idx} className="mx-1">
                🏆
              </span>
            ))}
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Main Lagi */}
          <motion.button
            onClick={() => navigate("/quiz-start")}
            className="py-3 px-8 border-2 border-green-500 text-green-700 font-bold rounded-full text-lg hover:bg-green-50 transition duration-300"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Main Lagi
          </motion.button>

          {/* Kembali ke Home */}
          <motion.button
            onClick={() => navigate("/home")}
            className="py-3 px-8 bg-green-500 text-white font-bold rounded-full text-lg hover:bg-green-600 transition duration-300"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Kembali ke Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
