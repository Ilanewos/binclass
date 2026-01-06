import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";

// =======================
// Option Button (UI sama)
// =======================
const OptionButton = ({ option, onClick, isSelected, isAnswered }) => {
  let baseColor = "bg-green-500";

  if (isAnswered) {
    if (option.isCorrect) baseColor = "bg-green-600 border-2 border-green-900";
    else if (isSelected && !option.isCorrect)
      baseColor = "bg-red-500 border-2 border-red-700";
    else baseColor = "bg-gray-300 text-gray-700";
  } else if (isSelected)
    baseColor = "bg-green-400 border-2 border-green-700 shadow-md";

  return (
    <motion.button
      onClick={() => !isAnswered && onClick(option)}
      className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white mt-4 transition-all
        ${isAnswered ? "cursor-default" : "cursor-pointer"} 
        ${baseColor}`}
      whileHover={!isAnswered ? { scale: 1.02 } : {}}
      whileTap={!isAnswered ? { scale: 0.98 } : {}}
      disabled={isAnswered}
    >
      {option.text}
    </motion.button>
  );
};

// =======================
// QuizQuestionPage
// =======================
export default function QuizQuestionPage() {
  const navigate = useNavigate();

  const runtime = useMemo(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("binclass_quiz_runtime") || "{}"
      );
    } catch {
      return {};
    }
  }, []);

  const sesiId = runtime?.sesi_id;
  const rawSoal = Array.isArray(runtime?.soal) ? runtime.soal : [];

  // map bentuk BE -> bentuk FE (tanpa ubah tampilan)
  const [questions, setQuestions] = useState(() =>
    rawSoal.map((s) => ({
      soal_id: s.soal_id,
      question: s.pertanyaan,
      image: s.image_url || null,
      options: (s.opsi || []).slice(0, 4).map((o) => ({
        id: o.id,
        text: o.teks,
        isCorrect: false, // nanti diisi setelah jawab
      })),
    }))
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!sesiId || questions.length === 0) {
      // kalau user masuk langsung tanpa start
      navigate("/quiz-start");
    }
  }, [sesiId, questions.length, navigate]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // =======================
  // FIX: Ambil status benar dari currentQuestion.options (bukan dari selectedAnswer)
  // =======================
  const selectedOption = currentQuestion?.options?.find(
    (o) => Number(o.id) === Number(selectedAnswer?.id)
  );
  const isSelectedCorrect = !!selectedOption?.isCorrect;

  const handleSelectAnswer = async (option) => {
    if (isAnswered) return;

    setSelectedAnswer(option);

    try {
      const res = await api.post("/user/kuis/jawab", {
        sesi_id: sesiId,
        soal_id: currentQuestion.soal_id,
        opsi_id: option.id,
      });

      const benar = !!res.data?.benar;
      const correctId = res.data?.correct_opsi_id;

      // set isCorrect untuk pewarnaan UI (tanpa ubah tampilan)
      setQuestions((prev) =>
        prev.map((q, idx) => {
          if (idx !== currentIndex) return q;
          return {
            ...q,
            options: q.options.map((o) => ({
              ...o,
              isCorrect: correctId ? Number(o.id) === Number(correctId) : false,
            })),
          };
        })
      );

      if (benar) setScore((p) => p + 1);
    } catch (e) {
      alert(e?.response?.data?.message || "Gagal mengirim jawaban");
      setSelectedAnswer(null);
    }
  };

  const handleNext = async () => {
    if (!selectedAnswer) return alert("Pilih jawaban terlebih dahulu!");
    if (!isAnswered) setIsAnswered(true);
    else {
      if (isLastQuestion) {
        try {
          // finalize score di backend
          const fin = await api.post(`/user/kuis/selesai/${sesiId}`);
          const finalScore = fin.data?.skor ?? score;

          navigate("/quiz-result", {
            state: { score: finalScore, totalQuestions: questions.length },
          });
        } catch (e) {
          navigate("/quiz-result", {
            state: { score, totalQuestions: questions.length },
          });
        }
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      }
    }
  };

  const total = questions.length || 10;
  const progressPercentage = ((currentIndex + 1) / total) * 100;

  if (!currentQuestion) return null;

  return (
    <div className="flex justify-center min-h-screen pt-20 pb-10 bg-purple-600 px-4">
      <motion.div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            🎮 Kuis Sampah Pintar
          </h2>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="text-sm font-semibold text-gray-600 mb-2">
            Pertanyaan {currentIndex + 1} dari {total}
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2.5">
            <motion.div
              className="bg-green-500 h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.7 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <motion.div className="p-6 md:p-8 bg-gray-100 rounded-xl shadow-inner text-center">
          <div className="mb-6 h-24 flex justify-center items-center">
            {currentQuestion.image ? (
              <img
                src={currentQuestion.image}
                className="h-full object-contain"
                alt="quiz"
              />
            ) : (
              <span className="text-6xl">🍌</span>
            )}
          </div>
          <h3 className="text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed">
            {currentQuestion.question}
          </h3>
        </motion.div>

        {/* Options */}
        <div className="mt-6">
          {currentQuestion.options.map((option, idx) => (
            <OptionButton
              key={idx}
              option={option}
              onClick={handleSelectAnswer}
              isSelected={selectedAnswer?.id === option.id}
              isAnswered={isAnswered}
            />
          ))}
        </div>

        {/* Next / Finish Button */}
        <motion.button
          onClick={handleNext}
          className={`w-full py-3 mt-8 rounded-full font-bold text-lg text-white transition-all
            ${
              selectedAnswer || isAnswered
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          disabled={!selectedAnswer && !isAnswered}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLastQuestion && isAnswered
            ? "Selesai 🏁"
            : isAnswered
            ? "Lanjut ➡️"
            : "Kunci Jawaban"}
        </motion.button>

        {/* Feedback */}
        {isAnswered && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-4 text-center font-bold text-lg ${
              isSelectedCorrect ? "text-green-700" : "text-red-600"
            }`}
          >
            {isSelectedCorrect
              ? "🎉 Jawabanmu Benar!"
              : "❌ Jawaban Salah. Lanjut ke pertanyaan berikutnya."}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
