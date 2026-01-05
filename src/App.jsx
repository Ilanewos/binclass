import { BrowserRouter, Routes, Route } from "react-router-dom";

// ✅ TAMBAHAN (toast)
import { Toaster } from "react-hot-toast";

// PUBLIC
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SplashPage from "./pages/SplashPage";

// USER
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import QuizStartPage from "./pages/QuizStartPage";
import QuizQuestionPage from "./pages/QuizQuestionPage";
import QuizResultPage from "./pages/QuizResultPage";
import ClassificationStartPage from "./pages/ClassificationStartPage";
import ClassificationResultPage from "./pages/ClassificationResultPage";
import ArticlePage from "./pages/ArticlePage";

// ADMIN
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import QuizAdmin from "./pages/admin/QuizAdmin";
import ArticleAdmin from "./pages/admin/ArticleAdmin";
import AdminML from "./pages/admin/AdminML";

// ROUTE GUARD
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

export default function App() {
  return (
    <BrowserRouter>
      {/* ✅ TAMBAHAN: cukup sekali di root */}
      <Toaster position="top-center" />

      <Routes>
        {/* ===================== */}
        {/* SPLASH */}
        {/* ===================== */}
        <Route path="/splash" element={<SplashPage />} />
        {/* ===================== */}
        {/* PUBLIC */}
        {/* ===================== */}
        <Route path="/" element={<SplashPage />} />{" "}
        {/* ✅ TAMBAHAN: buka web langsung splash */}
        <Route path="/login" element={<LoginPage />} />{" "}
        {/* ✅ TAMBAHAN: login pindah ke /login */}
        <Route path="/register" element={<RegisterPage />} />
        {/* ===================== */}
        {/* USER */}
        {/* ===================== */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Navbar />
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz-start"
          element={
            <ProtectedRoute>
              <Navbar />
              <QuizStartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz-question"
          element={
            <ProtectedRoute>
              <Navbar />
              <QuizQuestionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz-result"
          element={
            <ProtectedRoute>
              <Navbar />
              <QuizResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/klasifikasi"
          element={
            <ProtectedRoute>
              <Navbar />
              <ClassificationStartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/klasifikasi-result"
          element={
            <ProtectedRoute>
              <Navbar />
              <ClassificationResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artikel"
          element={
            <ProtectedRoute>
              <Navbar />
              <ArticlePage />
            </ProtectedRoute>
          }
        />
        {/* ===================== */}
        {/* ADMIN */}
        {/* ===================== */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="articles" element={<ArticleAdmin />} />
          <Route path="quizzes" element={<QuizAdmin />} />
          <Route path="ml" element={<AdminML />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
