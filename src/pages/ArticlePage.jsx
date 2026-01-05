// src/pages/ArticlePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  publicGetArticleDetail,
  publicListArticles,
} from "../utils/articleApi";

/* ==========================
   CARD (TETAP)
========================== */
const ArticleCard = ({ article, onOpen }) => (
  <motion.div
    whileHover={{ y: -10 }}
    className="bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden"
  >
    <div className="bg-green-500 h-40 flex items-center justify-center text-6xl">
      {article.icon || "📄"}
    </div>

    <div className="p-6 flex flex-col flex-grow">
      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full w-fit mb-3">
        {article.tag || "Umum"}
      </span>

      <h3 className="font-bold text-xl mb-2">{article.title}</h3>
      <p className="text-gray-600 text-sm flex-grow">{article.desc}</p>

      <button
        onClick={() => onOpen(article.id)}
        className="mt-4 bg-green-500 text-white py-2 rounded-xl font-semibold"
      >
        Baca Selengkapnya →
      </button>
    </div>
  </motion.div>
);

/* ==========================
   MODAL DETAIL (TETAP)
========================== */
const ArticleModal = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-8 relative"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-red-500 text-white rounded-full px-3 py-1"
          >
            ✕
          </button>

          <h2 className="text-3xl font-black text-green-600 mb-2">
            {article.title}
          </h2>

          <span className="inline-block bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-semibold mb-6">
            {article.tag}
          </span>

          <div className="text-gray-700 space-y-3">
            <p style={{ whiteSpace: "pre-line" }}>{article.content}</p>

            {article.youtube && (
              <div className="mt-6">
                <p className="font-semibold mb-2">🎥 Video Edukasi:</p>
                <iframe
                  className="w-full aspect-video rounded-xl"
                  src={article.youtube}
                  title="Video Artikel"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ==========================
   PAGE (INTEGRASI API)
========================== */
export default function ArticlePage() {
  const [selectedId, setSelectedId] = useState(null);

  const [articles, setArticles] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [errorList, setErrorList] = useState("");

  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch list artikel public
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingList(true);
        setErrorList("");

        const rows = await publicListArticles();

        // map field BE -> FE card (tanpa ubah UI)
        const mapped = rows.map((r) => ({
          id: r.id,
          title: r.title,
          desc: r.deskripsi || "",
          tag: r.tags || r.category || "Umum",
          icon: r.icon || "📄",
        }));

        if (alive) setArticles(mapped);
      } catch (e) {
        if (alive) setErrorList("Gagal memuat artikel.");
      } finally {
        if (alive) setLoadingList(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Fetch detail saat klik
  useEffect(() => {
    let alive = true;

    if (!selectedId) {
      setDetail(null);
      return;
    }

    (async () => {
      try {
        setLoadingDetail(true);

        const r = await publicGetArticleDetail(selectedId);

        const mapped = {
          id: r.id,
          title: r.title,
          tag: r.tags || r.category || "Umum",
          content: r.content || "",
          youtube: r.video_url || "",
        };

        if (alive) setDetail(mapped);
      } catch (e) {
        if (alive) setDetail(null);
      } finally {
        if (alive) setLoadingDetail(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [selectedId]);

  const modalArticle = useMemo(() => {
    if (!selectedId) return null;
    if (loadingDetail) {
      return {
        title: "Memuat...",
        tag: "",
        content: "Sedang mengambil data...",
        youtube: "",
      };
    }
    return detail;
  }, [selectedId, detail, loadingDetail]);

  return (
    <div className="relative min-h-screen bg-transparent pt-20 pb-12 px-4 overflow-hidden">
      {/* ✅ TAMBAHAN: OVERLAY GAMBAR */}
      <img
        src="/bgbinclas.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center opacity-35 pointer-events-none"
        style={{ mixBlendMode: "multiply" }}
      />

      {/* ✅ TAMBAHAN: OVERLAY WARNA */}
      <div className="absolute inset-0 bg-purple-900/25 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl p-8 mb-10 text-center shadow-2xl">
          <h1 className="text-5xl font-black text-green-600 mb-3">
            📚 Artikel Tentang Sampah
          </h1>
          <p className="text-gray-600 text-lg">
            Klik artikel untuk membaca detailnya
          </p>
        </div>

        {errorList && (
          <div className="bg-red-100 text-red-700 p-4 rounded-2xl mb-6">
            {errorList}
          </div>
        )}

        {loadingList ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl">
            Memuat daftar artikel...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} onOpen={setSelectedId} />
            ))}
          </div>
        )}
      </div>

      <ArticleModal
        article={modalArticle}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
