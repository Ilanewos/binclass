import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { scanSampah } from "../services/scanService";

export default function ClassificationStartPage() {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Preview (untuk UI)
  const [capturedImage, setCapturedImage] = useState(null);

  // File asli untuk dikirim
  const [capturedFile, setCapturedFile] = useState(null);

  // ✅ TAMBAHAN: state loading saat proses scan
  const [isScanning, setIsScanning] = useState(false);

  const navigate = useNavigate();

  // ✅ TAMBAHAN: Loading Overlay (FE only)
  const LoadingOverlay = ({ show, text = "Sedang memproses scan..." }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-[320px] text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full border-4 border-gray-300 border-t-green-600 animate-spin" />
          </div>
          <p className="font-semibold text-gray-800">{text}</p>
          <p className="text-sm text-gray-500 mt-2">
            Mohon tunggu, gambar sedang dianalisis.
          </p>
        </div>
      </div>
    );
  };

  const openCamera = async () => {
    setCapturedImage(null);
    setCapturedFile(null);
    setIsCameraOpen(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Tidak dapat membuka kamera. Periksa izin kamera!");
      console.error(err);
    }
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((t) => t.stop());
  };

  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    // Buat File langsung dari kamera (tanpa base64 bolak-balik)
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          alert("Gagal mengambil foto.");
          return;
        }

        const file = new File([blob], "camera.jpg", { type: "image/jpeg" });
        const previewUrl = URL.createObjectURL(blob);

        setCapturedFile(file);
        setCapturedImage(previewUrl);

        closeCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Simpan file asli
    setCapturedFile(file);

    // Preview tetap base64 (untuk UI)
    const reader = new FileReader();
    reader.onloadend = () => setCapturedImage(reader.result);
    reader.readAsDataURL(file);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setCapturedFile(null);
  };

  const goBackHome = () => navigate("/home");

  const goToResult = async () => {
    try {
      if (!capturedFile) throw new Error("File belum ada");

      // ✅ TAMBAHAN: aktifkan loading saat proses scan
      setIsScanning(true);

      const result = await scanSampah(capturedFile);

      navigate("/klasifikasi-result", {
        state: {
          imagePreview: capturedImage,
          result: result,
        },
      });
    } catch (err) {
      console.error("SCAN ERROR:", err.response?.data || err.message);
      alert("Gagal melakukan klasifikasi");
    } finally {
      // ✅ TAMBAHAN: matikan loading jika error / setelah selesai
      setIsScanning(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-purple-600 p-6 pt-20">
      {/* ✅ TAMBAHAN: overlay loading proses scan */}
      <LoadingOverlay show={isScanning} text="Sedang memproses scan..." />

      <motion.div
        className="bg-white p-8 rounded-2xl shadow-2xl max-w-xl w-full text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-extrabold text-green-700">
          Klasifikasi Sampah 📸
        </h2>

        {!capturedImage && (
          <p className="text-gray-600 mt-2 mb-6">
            Upload atau ambil foto sampah untuk diklasifikasi.
          </p>
        )}

        {!capturedImage && (
          <>
            <motion.div
              className="border-4 border-dashed border-gray-300 rounded-xl p-12 mb-8 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
              onClick={() => fileInputRef.current.click()}
              whileHover={{ scale: 1.02, borderColor: "#4CAF50" }}
            >
              <span className="text-6xl block">📸✨</span>
              <p className="text-gray-600 font-medium mt-2">
                Klik untuk Upload Foto
              </p>
            </motion.div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />

            <div className="flex flex-col gap-3 mt-4">
              <motion.button
                onClick={() => fileInputRef.current.click()}
                className="py-3 bg-green-500 text-white rounded-xl font-bold"
                whileHover={{ scale: 1.05 }}
              >
                📤 Upload Foto
              </motion.button>

              <motion.button
                onClick={openCamera}
                className="py-3 bg-green-500 text-white rounded-xl font-bold"
                whileHover={{ scale: 1.05 }}
              >
                📷 Scan Kamera
              </motion.button>

              <motion.button
                onClick={goBackHome}
                className="py-3 bg-gray-500 text-white rounded-xl font-bold"
                whileHover={{ scale: 1.05 }}
              >
                ⬅ Kembali
              </motion.button>
            </div>
          </>
        )}

        {capturedImage && (
          <>
            <img
              src={capturedImage}
              className="rounded-xl shadow-lg w-full mb-6"
              alt="preview"
            />

            <div className="flex flex-col gap-3">
              <motion.button
                onClick={goToResult}
                // ✅ TAMBAHAN: disable tombol saat scanning agar tidak double request
                disabled={isScanning}
                className={`py-3 bg-green-600 text-white rounded-xl font-bold ${
                  isScanning ? "opacity-70 cursor-not-allowed" : ""
                }`}
                whileHover={{ scale: 1.07 }}
              >
                🔍 Klasifikasikan
              </motion.button>

              <motion.button
                onClick={retakePhoto}
                // ✅ TAMBAHAN: disable saat scanning
                disabled={isScanning}
                className={`py-3 bg-yellow-500 text-white rounded-xl font-bold ${
                  isScanning ? "opacity-70 cursor-not-allowed" : ""
                }`}
                whileHover={{ scale: 1.07 }}
              >
                🔄 Ulang Foto
              </motion.button>

              <motion.button
                onClick={goBackHome}
                // ✅ TAMBAHAN: disable saat scanning
                disabled={isScanning}
                className={`py-3 bg-gray-500 text-white rounded-xl font-bold ${
                  isScanning ? "opacity-70 cursor-not-allowed" : ""
                }`}
                whileHover={{ scale: 1.07 }}
              >
                ⬅ Kembali ke Home
              </motion.button>
            </div>
          </>
        )}
      </motion.div>

      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-sm rounded-xl"
          />

          <button
            onClick={capturePhoto}
            className="mt-5 bg-green-500 text-white px-6 py-3 rounded-full font-bold"
          >
            📸 Ambil Foto
          </button>

          <button
            onClick={closeCamera}
            className="mt-3 bg-white text-black px-6 py-2 rounded-lg"
          >
            ✖ Tutup Kamera
          </button>
        </div>
      )}
    </div>
  );
}
