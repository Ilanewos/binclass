// src/utils/articleApi.js
import api from "../services/api"; // ⬅️ FIX PATH
import axios from "axios";

// ================= ADMIN =================
export const adminGetArticles = async () => {
  const res = await api.get("/admin/articles");
  return res.data;
};

export const adminCreateArticle = async (formData) => {
  const res = await api.post("/admin/articles", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const adminUpdateArticle = async (id, formData) => {
  const res = await api.put(`/admin/articles/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const adminDeleteArticle = async (id) => {
  const res = await api.delete(`/admin/articles/${id}`);
  return res.data;
};

// ================= PUBLIC =================
const publicApi = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const publicListArticles = async () => {
  const res = await publicApi.get("/public/articles");
  return res.data;
};

export const publicGetArticleDetail = async (id) => {
  const res = await publicApi.get(`/public/articles/${id}`);
  return res.data;
};
