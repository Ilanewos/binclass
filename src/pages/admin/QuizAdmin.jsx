import { useEffect, useMemo, useState } from "react";
import adminAxios from "../../utils/adminAxios";

const QuizAdmin = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [question, setQuestion] = useState("");
  const [image, setImage] = useState("");
  const [options, setOptions] = useState({ a: "", b: "", c: "", d: "" });
  const [correctAnswer, setCorrectAnswer] = useState("a");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ===========================
  // Helper: ambil kuis_id default (tanpa ubah UI)
  // ===========================
  const getDefaultKuisId = async () => {
    const res = await adminAxios.get("/admin/kuis");
    const list = Array.isArray(res.data) ? res.data : [];
    return list[0]?.id || null;
  };

  // ===========================
  // Mapper: BE -> UI shape
  // ===========================
  const mapSoalToUI = (s) => {
    const opsi = Array.isArray(s.opsi) ? s.opsi : [];

    // ambil 4 opsi (kalau kurang, isi kosong biar UI tetap)
    const o1 = opsi[0]?.teks || "";
    const o2 = opsi[1]?.teks || "";
    const o3 = opsi[2]?.teks || "";
    const o4 = opsi[3]?.teks || "";

    // tentukan correctAnswer dari field benar
    const idxTrue = opsi.findIndex((o) => !!o.benar);
    const correct = ["a", "b", "c", "d"][idxTrue] || "a";

    return {
      id: s.id,
      question: s.pertanyaan || "",
      image: s.image_url || "",
      options: { a: o1, b: o2, c: o3, d: o4 },
      correctAnswer: correct,
      _raw: s, // simpan raw utk update (opsi_id dst)
    };
  };

  // ===========================
  // Mapper: UI -> BE payload
  // ===========================
  const mapUIToPayloadTambahSoal = (kuisId, ui) => {
    const keys = ["a", "b", "c", "d"];
    const opsi = keys.map((k) => ({
      teks: (ui.options?.[k] || "").trim(),
      benar: ui.correctAnswer === k,
    }));

    return {
      kuis_id: kuisId,
      pertanyaan: ui.question.trim(),
      image_url: ui.image?.trim() || null,
      opsi,
    };
  };

  // ===========================
  // API wrappers (REAL)
  // ===========================
  const apiFetchQuizzes = async () => {
    // ambil semua soal + opsi (admin)
    const res = await adminAxios.get("/admin/kuis/soal");
    const arr = Array.isArray(res.data) ? res.data : [];
    return arr.map(mapSoalToUI);
  };

  const apiCreateQuiz = async (payloadUI) => {
    const kuisId = await getDefaultKuisId();
    if (!kuisId) throw new Error("Belum ada data kuis di tabel kuis.");

    const bePayload = mapUIToPayloadTambahSoal(kuisId, payloadUI);
    await adminAxios.post("/admin/kuis/soal", bePayload);
  };

  const apiUpdateQuiz = async (id, payloadUI) => {
    // update soal (pertanyaan + image)
    await adminAxios.put(`/admin/kuis/soal/${id}`, {
      pertanyaan: payloadUI.question.trim(),
      image_url: payloadUI.image?.trim() || null,
    });

    // update opsi:
    // - cara aman: ambil detail soal (opsi_id), lalu put opsi satu-satu
    const detail = await adminAxios.get(`/admin/kuis/soal/${id}`);
    const opsiArr = Array.isArray(detail.data?.opsi) ? detail.data.opsi : [];

    const keys = ["a", "b", "c", "d"];
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const opsiId = opsiArr[i]?.id;

      // kalau belum ada opsi di db (kurang dari 4), tambah baru
      if (!opsiId) {
        await adminAxios.post("/admin/kuis/opsi", {
          soal_id: id,
          teks_opsi: (payloadUI.options?.[k] || "").trim(),
          benar: payloadUI.correctAnswer === k,
        });
      } else {
        await adminAxios.put(`/admin/kuis/opsi/${opsiId}`, {
          teks_opsi: (payloadUI.options?.[k] || "").trim(),
          benar: payloadUI.correctAnswer === k,
        });
      }
    }
  };

  const apiDeleteQuiz = async (id) => {
    // soft delete soal
    await adminAxios.delete(`/admin/kuis/soal/${id}`);
  };

  // ===========================
  // FETCH AWAL
  // ===========================
  useEffect(() => {
    const run = async () => {
      try {
        setError("");
        setLoading(true);
        const data = await apiFetchQuizzes();
        setQuizzes(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.response?.data?.message || "Gagal memuat data kuis.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  // ===========================
  // HELPERS
  // ===========================
  const resetForm = () => {
    setQuestion("");
    setImage("");
    setOptions({ a: "", b: "", c: "", d: "" });
    setCorrectAnswer("a");
    setEditId(null);
    setShowForm(false);
    setError("");
  };

  const validate = () => {
    if (!question.trim()) return "Pertanyaan wajib diisi.";
    if (
      !options.a.trim() ||
      !options.b.trim() ||
      !options.c.trim() ||
      !options.d.trim()
    )
      return "Semua opsi jawaban A–D wajib diisi.";
    if (!["a", "b", "c", "d"].includes(correctAnswer))
      return "Jawaban benar tidak valid.";
    return "";
  };

  const sortedQuizzes = useMemo(() => {
    return [...quizzes].sort((x, y) => {
      const ax = Number(x.id);
      const ay = Number(y.id);
      if (!Number.isNaN(ax) && !Number.isNaN(ay)) return ay - ax;
      return 0;
    });
  }, [quizzes]);

  // ===========================
  // SUBMIT (ADD / EDIT)
  // ===========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) return setError(msg);

    const payload = {
      id: editId || Date.now(),
      question: question.trim(),
      image: image.trim(),
      options: {
        a: options.a.trim(),
        b: options.b.trim(),
        c: options.c.trim(),
        d: options.d.trim(),
      },
      correctAnswer,
    };

    setSaving(true);

    if (editId) {
      const before = quizzes;
      setQuizzes((prev) => prev.map((q) => (q.id === editId ? payload : q)));

      try {
        await apiUpdateQuiz(editId, payload);
        // refresh biar sinkron sama DB
        const latest = await apiFetchQuizzes();
        setQuizzes(latest);
        resetForm();
      } catch (e) {
        setQuizzes(before);
        setError(e?.response?.data?.message || "Gagal update soal.");
      } finally {
        setSaving(false);
      }
    } else {
      setQuizzes((prev) => [...prev, payload]);

      try {
        await apiCreateQuiz(payload);
        const latest = await apiFetchQuizzes();
        setQuizzes(latest);
        resetForm();
      } catch (e) {
        setQuizzes((prev) => prev.filter((q) => q.id !== payload.id));
        setError(e?.response?.data?.message || "Gagal menyimpan soal.");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleEdit = (quiz) => {
    setError("");
    setEditId(quiz.id);
    setQuestion(quiz.question || "");
    setImage(quiz.image || "");
    setOptions(quiz.options || { a: "", b: "", c: "", d: "" });
    setCorrectAnswer(quiz.correctAnswer || "a");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    setError("");
    if (!window.confirm("Yakin hapus soal ini?")) return;

    const before = quizzes;
    setQuizzes((prev) => prev.filter((q) => q.id !== id));

    try {
      setDeletingId(id);
      await apiDeleteQuiz(id);
    } catch (e) {
      setQuizzes(before);
      setError(e?.response?.data?.message || "Gagal menghapus soal.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p className="p-6">Loading data kuis...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Admin - Kuis</h1>
      <p className="text-sm text-gray-500 mb-4">
        Kelola soal kuis: tambah, edit, hapus, dan tentukan jawaban benar.
      </p>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={() => {
          setError("");
          setShowForm(!showForm);
          if (showForm) resetForm();
        }}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        {showForm ? "Batal" : "+ Tambah Soal"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 rounded shadow mb-6"
        >
          <label className="block mb-1 font-semibold">Pertanyaan</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full border p-2 rounded mb-3"
            placeholder="Contoh: Sampah organik itu apa?"
          />

          <label className="block mb-1 font-semibold">
            URL Gambar (opsional)
          </label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
            className="w-full border p-2 rounded mb-3"
          />

          {image && (
            <SafeImage
              src={image}
              alt="preview"
              className="max-h-40 mb-4 rounded border"
            />
          )}

          {["a", "b", "c", "d"].map((key) => (
            <div key={key} className="mb-2">
              <label className="block text-sm">
                Jawaban {key.toUpperCase()}
              </label>
              <input
                type="text"
                value={options[key]}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className="w-full border p-2 rounded"
                placeholder={`Isi opsi ${key.toUpperCase()}`}
              />
            </div>
          ))}

          <label className="block mt-3 font-semibold">Jawaban Benar</label>
          <select
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="a">A</option>
            <option value="b">B</option>
            <option value="c">C</option>
            <option value="d">D</option>
          </select>

          <button
            disabled={saving}
            type="submit"
            className={`mt-4 text-white px-4 py-2 rounded ${
              saving ? "bg-green-400 cursor-not-allowed" : "bg-green-600"
            }`}
          >
            {saving ? "Menyimpan..." : editId ? "Update Soal" : "Simpan Soal"}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {sortedQuizzes.map((quiz, index) => (
          <div key={quiz.id} className="border rounded p-4 bg-white shadow">
            <div className="flex justify-between items-start mb-2 gap-3">
              <h2 className="font-semibold">
                {index + 1}. {quiz.question}
              </h2>

              <div className="space-x-2 whitespace-nowrap">
                <button
                  onClick={() => handleEdit(quiz)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(quiz.id)}
                  disabled={deletingId === quiz.id}
                  className={`text-white px-3 py-1 rounded text-sm ${
                    deletingId === quiz.id
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600"
                  }`}
                >
                  {deletingId === quiz.id ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>

            {quiz.image && (
              <SafeImage
                src={quiz.image}
                alt="quiz"
                className="max-h-40 mb-3 rounded"
              />
            )}

            <ul className="text-sm">
              {Object.entries(quiz.options || {}).map(([key, value]) => (
                <li
                  key={key}
                  className={
                    quiz.correctAnswer === key
                      ? "text-green-600 font-semibold"
                      : ""
                  }
                >
                  {key.toUpperCase()}. {value}
                  {quiz.correctAnswer === key && " ✅"}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {sortedQuizzes.length === 0 && (
          <p className="text-gray-500">Belum ada soal kuis.</p>
        )}
      </div>
    </div>
  );
};

function SafeImage({ src, alt, className }) {
  const [ok, setOk] = useState(true);

  useEffect(() => {
    setOk(true);
  }, [src]);

  if (!src || !ok) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setOk(false)}
    />
  );
}

export default QuizAdmin;
