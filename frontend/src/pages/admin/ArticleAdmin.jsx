// src/pages/admin/ArticleAdmin.jsx
import { useEffect, useMemo, useState } from "react";
import {
  adminCreateArticle,
  adminDeleteArticle,
  adminGetArticles,
  adminUpdateArticle,
} from "../../utils/articleApi";

export default function ArticleAdmin() {
  const [articles, setArticles] = useState([]);

  const emptyForm = {
    id: null,
    title: "",
    tag: "",
    desc: "",
    content: "",
    youtube: "",
    icon: "",
    category: "",
    imageFile: null,
    imageUrl: "",
    old_image: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setError("");
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, imageFile: file }));
  };

  // Ambil ID YouTube dari link/embed
  const getYouTubeId = (url) => {
    if (!url) return "";
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7] && match[7].length === 11 ? match[7] : "";
  };

  const toYouTubeEmbed = (url) => {
    const id = getYouTubeId(url);
    if (!id) return "";
    return `https://www.youtube.com/embed/${id}`;
  };

  // Validasi ringan
  const validateForm = () => {
    if (!form.title.trim()) return "Judul artikel wajib diisi.";
    if (!form.tag.trim()) return "Tag/Kategori wajib diisi.";
    if (form.desc.length > 140)
      return "Deskripsi terlalu panjang (maks 140 karakter).";
    if (form.youtube && !getYouTubeId(form.youtube))
      return "Link YouTube tidak valid.";
    return "";
  };

  // LOAD DATA ADMIN
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const rows = await adminGetArticles();

        const mapped = rows.map((r) => ({
          id: r.id,
          title: r.title || "",
          tag: r.tags || "",
          desc: r.deskripsi || "",
          content: r.content || "",
          youtube: r.video_url || "",
          icon: r.icon || "",
          category: r.category || "",
          old_image: r.image_file || "",
          createdAt: r.created_at || "",
          updatedAt: r.updated_at || r.created_at || "",
        }));

        if (alive) setArticles(mapped);
      } catch (e) {
        if (alive)
          setError("Gagal memuat artikel admin (cek token admin & endpoint).");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const msg = validateForm();
    if (msg) return setError(msg);

    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("tags", form.tag);
      fd.append("deskripsi", form.desc);
      fd.append("icon", form.icon);
      fd.append("content", form.content);
      fd.append("video_url", form.youtube ? toYouTubeEmbed(form.youtube) : "");
      fd.append("image_url", form.imageUrl || "");
      fd.append("category", form.category || "");

      if (form.imageFile) fd.append("image", form.imageFile);

      if (isEdit) {
        fd.append("old_image", form.old_image || "");
        await adminUpdateArticle(form.id, fd);

        setArticles((prev) =>
          prev.map((a) =>
            a.id === form.id
              ? {
                  ...a,
                  title: form.title,
                  tag: form.tag,
                  desc: form.desc,
                  content: form.content,
                  youtube: form.youtube ? toYouTubeEmbed(form.youtube) : "",
                  icon: form.icon,
                  category: form.category,
                  updatedAt: new Date().toISOString(),
                }
              : a
          )
        );
      } else {
        const created = await adminCreateArticle(fd);

        setArticles((prev) => [
          {
            id: created.id, // dari backend insertId
            title: form.title,
            tag: form.tag,
            desc: form.desc,
            content: form.content,
            youtube: form.youtube ? toYouTubeEmbed(form.youtube) : "",
            icon: form.icon,
            category: form.category,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            old_image: "",
          },
          ...prev,
        ]);
      }

      setForm(emptyForm);
      setIsEdit(false);
    } catch (e) {
      setError("Gagal menyimpan artikel (cek payload/token/endpoint).");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (a) => {
    setForm({
      id: a.id,
      title: a.title,
      tag: a.tag,
      desc: a.desc,
      content: a.content,
      youtube: a.youtube,
      icon: a.icon,
      category: a.category || "",
      imageFile: null,
      imageUrl: "",
      old_image: a.old_image || "",
    });
    setIsEdit(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setForm(emptyForm);
    setIsEdit(false);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus artikel ini?")) return;

    try {
      await adminDeleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      console.log(
        "DELETE ERROR:",
        e?.response?.status,
        e?.response?.data || e.message
      );
      setError("Gagal menghapus artikel.");
    }
  };

  // Urutkan terbaru di atas
  const sortedArticles = useMemo(() => {
    return [...articles].sort(
      (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
    );
  }, [articles]);

  const inputStyle = {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: 40 }}>
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          background: "white",
          borderRadius: 16,
          padding: 30,
        }}
      >
        <h1 style={{ marginBottom: 30 }}>🛠️ Admin Artikel</h1>

        {/* FORM */}
        <section style={{ marginBottom: 50 }}>
          <h2>{isEdit ? "✏️ Edit Artikel" : "➕ Tambah Artikel"}</h2>

          {error && (
            <div
              style={{
                margin: "15px 0",
                padding: 12,
                borderRadius: 10,
                background: "#fee2e2",
                color: "#991b1b",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 15 }}>
            <input
              style={inputStyle}
              name="title"
              placeholder="Judul Artikel"
              value={form.title}
              onChange={handleChange}
            />

            <input
              style={inputStyle}
              name="tag"
              placeholder="Tag / Kategori"
              value={form.tag}
              onChange={handleChange}
            />

            <input
              style={inputStyle}
              name="desc"
              placeholder="Deskripsi singkat (maks 140 karakter)"
              maxLength={140}
              value={form.desc}
              onChange={handleChange}
            />

            <input
              style={inputStyle}
              name="icon"
              placeholder="Icon (emoji)"
              value={form.icon}
              onChange={handleChange}
            />

            <textarea
              style={{ ...inputStyle, minHeight: 120 }}
              name="content"
              placeholder="Isi artikel"
              value={form.content}
              onChange={handleChange}
            />

            <input
              style={inputStyle}
              name="youtube"
              placeholder="Link YouTube (opsional)"
              value={form.youtube}
              onChange={handleChange}
            />

            {/* Upload gambar (opsional, backend kamu support) */}
            <input
              style={inputStyle}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

            {getYouTubeId(form.youtube) && (
              <img
                src={`https://img.youtube.com/vi/${getYouTubeId(
                  form.youtube
                )}/hqdefault.jpg`}
                alt="Preview"
                style={{ width: "100%", borderRadius: 10 }}
              />
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                disabled={saving}
                style={{
                  flex: 1,
                  padding: 12,
                  background: "#16a34a",
                  color: "white",
                  borderRadius: 10,
                  border: "none",
                  fontWeight: "bold",
                }}
              >
                {saving
                  ? "Menyimpan..."
                  : isEdit
                  ? "Simpan Perubahan"
                  : "Tambah Artikel"}
              </button>

              {isEdit && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    padding: 12,
                    background: "#e5e7eb",
                    borderRadius: 10,
                    border: "none",
                  }}
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </section>

        {/* LIST */}
        <section>
          <h2>📄 Daftar Artikel</h2>

          {loading ? (
            <p style={{ color: "#6b7280" }}>Memuat...</p>
          ) : sortedArticles.length === 0 ? (
            <p style={{ color: "#6b7280" }}>Belum ada artikel.</p>
          ) : (
            sortedArticles.map((a) => {
              const ytId = getYouTubeId(a.youtube);
              return (
                <div
                  key={a.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 20,
                    background: "#fafafa",
                  }}
                >
                  <h3>
                    {a.icon} {a.title}
                  </h3>
                  <small>{a.tag}</small>
                  <p>{a.desc}</p>

                  {ytId && (
                    <iframe
                      title={`yt-${a.id}`}
                      src={`https://www.youtube.com/embed/${ytId}`}
                      width="100%"
                      height="240"
                      style={{ borderRadius: 10, border: "none" }}
                      allowFullScreen
                    />
                  )}

                  <div style={{ marginTop: 10 }}>
                    <button onClick={() => handleEdit(a)}>✏️ Edit</button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      style={{ marginLeft: 10 }}
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
