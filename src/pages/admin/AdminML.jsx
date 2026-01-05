import { useEffect, useMemo, useState } from "react";
import adminAxios from "../../utils/adminAxios";

export default function AdminML() {
  const [scanData, setScanData] = useState([]); // ✅ mulai kosong, ambil dari DB

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // ===========================
  // 1. Fetch scans dari backend
  // ===========================
  const apiFetchScans = async () => {
    const res = await adminAxios.get("/admin/scan");
    if (!res.data?.success) throw new Error("FETCH_FAILED");
    return res.data.data || [];
  };

  // ===========================
  // 2. Delete scan (soft delete)
  // ===========================
  const apiDeleteScan = async (id) => {
    const res = await adminAxios.delete(`/admin/scan/${id}`);
    if (!res.data?.success) throw new Error("DELETE_FAILED");
    return true;
  };

  // ===========================
  // 3. Fetch awal
  // ===========================
  useEffect(() => {
    const run = async () => {
      try {
        setError("");
        setIsLoading(true);

        const rows = await apiFetchScans();
        const mapped = rows.map((r) => ({
          id: r.id,
          user: r.user_id ? `user-${r.user_id}` : "anon",
          image: r.image_path
            ? `http://localhost:5000/${String(r.image_path).replace(
                /\\/g,
                "/"
              )}`
            : "",
          prediction: r.label || "-",
          confidence: Number(r.confidence ?? 0),
          scannedAt: r.created_at || "",
        }));
        setScanData(mapped);
      } catch (e) {
        console.log(
          "DELETE ERROR:",
          e?.response?.status,
          e?.response?.data || e.message
        );
        setScanData(before);
        setError("Gagal menghapus data scan.");
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, []);

  // ===========================
  // 4. Hapus data scan
  // ===========================
  const handleDelete = async (id) => {
    setError("");
    if (!window.confirm("Yakin hapus data scan ini?")) return;

    const before = scanData;
    setScanData((prev) => prev.filter((d) => d.id !== id));

    try {
      setDeletingId(id);
      await apiDeleteScan(id);
    } catch (e) {
      setScanData(before);
      setError("Gagal menghapus data scan.");
    } finally {
      setDeletingId(null);
    }
  };

  // ===========================
  // 5. Helper tampilan (sorting)
  // ===========================
  const sorted = useMemo(() => {
    return [...scanData].sort((a, b) => {
      const da = new Date(a.scannedAt).getTime();
      const db = new Date(b.scannedAt).getTime();
      return (isNaN(db) ? 0 : db) - (isNaN(da) ? 0 : da);
    });
  }, [scanData]);

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: 40 }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          background: "white",
          borderRadius: 16,
          padding: 30,
        }}
      >
        <h1 style={{ marginBottom: 10 }}>🤖 Admin ML – Riwayat Scan User</h1>

        <p style={{ marginBottom: 20, color: "#6b7280" }}>
          Monitoring hasil klasifikasi sampah dari user untuk evaluasi.
        </p>

        {error && (
          <div
            style={{
              marginBottom: 15,
              padding: 12,
              borderRadius: 10,
              background: "#fee2e2",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        )}

        {isLoading ? (
          <p style={{ color: "#6b7280" }}>Memuat data...</p>
        ) : sorted.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Belum ada riwayat scan.</p>
        ) : (
          sorted.map((d, index) => (
            <div
              key={d.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 20,
                marginBottom: 20,
                background: "#fafafa",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div>
                  <h3 style={{ margin: 0 }}>
                    #{index + 1} — {d.prediction}
                  </h3>
                  <small>User: {d.user}</small>

                  <p style={{ marginTop: 8 }}>
                    Confidence:{" "}
                    <strong
                      style={{
                        color: d.confidence < 0.7 ? "#dc2626" : "#16a34a",
                      }}
                    >
                      {(Number(d.confidence) * 100).toFixed(0)}%
                    </strong>
                  </p>

                  <p style={{ fontSize: 12, color: "#6b7280" }}>
                    Scan at: {d.scannedAt}
                  </p>
                </div>

                {/* Badge tetap ada tapi statis (tanpa verifikasi) */}
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontSize: 12,
                    background: "#e5e7eb",
                    color: "#374151",
                    height: "fit-content",
                  }}
                >
                  Scan
                </span>
              </div>

              {d.image ? (
                <img
                  src={d.image}
                  alt="scan"
                  style={{
                    width: 200,
                    borderRadius: 10,
                    marginTop: 15,
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : null}

              <div style={{ marginTop: 15 }}>
                {/* Tombol verifikasi DIHAPUS */}
                <button
                  disabled={deletingId === d.id}
                  onClick={() => handleDelete(d.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: "#dc2626",
                    color: "white",
                    cursor: deletingId === d.id ? "not-allowed" : "pointer",
                    opacity: deletingId === d.id ? 0.7 : 1,
                  }}
                >
                  {deletingId === d.id ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
