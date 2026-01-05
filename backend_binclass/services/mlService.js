// services/mlService.js

const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const { getSampahInfo } = require("./sampahInfo");

const ML_ENDPOINT = process.env.ML_ENDPOINT || "http://127.0.0.1:8000/predict";
const ML_TIMEOUT = 15000;

/**
 * Kirim gambar ke ML dan kembalikan hasil bersih
 */
async function predictSampah(imagePath) {
  const form = new FormData();
  form.append("image", fs.createReadStream(imagePath));

  try {
    const response = await axios.post(ML_ENDPOINT, form, {
      headers: form.getHeaders(),
      timeout: ML_TIMEOUT
    });

    const data = response.data;

    // Validasi response ML
    if (!data || !data.label || typeof data.confidence !== "number") {
      throw new Error("INVALID_ML_RESPONSE");
    }

    return {
      label: data.label,
      confidence: data.confidence,
      info: getSampahInfo(data.label)
    };

  } catch (error) {
    console.error("❌ ML SERVICE ERROR:", error.message);
    throw new Error("ML_SERVICE_ERROR");
  }
}

module.exports = {
  predictSampah
};
