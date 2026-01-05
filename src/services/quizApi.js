import api from "../utils/services/api";

/* =========================
   ADMIN
========================= */

export async function adminGetAllKuis() {
  const res = await api.get("/admin/kuis");
  return res.data; // (kamu backend return array r)
}

export async function adminCreateKuis(judul) {
  const res = await api.post("/admin/kuis", { judul });
  return res.data;
}

export async function adminGetSoalByKuis(kuisId) {
  const res = await api.get(`/admin/kuis/${kuisId}/soal`);
  return res.data; // array soal
}

export async function adminCreateSoal(payload) {
  // payload: { kuis_id, pertanyaan, image_url, opsi:[{teks, benar}] }
  const res = await api.post("/admin/kuis/soal", payload);
  return res.data;
}

export async function adminUpdateSoal(soalId, payload) {
  // payload: { pertanyaan, image_url }
  const res = await api.put(`/admin/kuis/soal/${soalId}`, payload);
  return res.data;
}

export async function adminDeleteSoal(soalId) {
  const res = await api.delete(`/admin/kuis/soal/${soalId}`);
  return res.data;
}

export async function adminUpdateOpsi(opsiId, payload) {
  // payload: { teks_opsi, benar, soal_id }
  const res = await api.put(`/admin/kuis/opsi/${opsiId}`, payload);
  return res.data;
}

/* =========================
   USER
========================= */

export async function userMulaiKuis(kuisId) {
  const res = await api.post(`/user/kuis/mulai/${kuisId}`);
  return res.data; // {success,data:{sesi_id, soal:[]}}
}

export async function userJawabSoal(payload) {
  // { sesi_id, soal_id, opsi_id }
  const res = await api.post("/user/kuis/jawab", payload);
  return res.data; // {success,data:{benar}}
}

export async function userSelesaiKuis(sesiId) {
  const res = await api.post(`/user/kuis/selesai/${sesiId}`);
  return res.data; // {success,data:{skor}}
}

export async function userRiwayatKuis() {
  const res = await api.get("/user/kuis/riwayat");
  return res.data;
}
