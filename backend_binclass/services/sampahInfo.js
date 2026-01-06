// services/sampahInfo.js

const sampahInfo = {
  organik: {
    title: "Sampah Organik 🌿",
    tips: [
      "🌿 Ini sampah organik! Pisahkan dari plastik ya, lalu bisa diolah jadi kompos untuk tanaman. 🌱",
      "🍌 Sisa makanan/kulit buah termasuk organik. Kumpulkan terpisah supaya tidak bau dan bisa jadi kompos.",
      "🪴 Buang sisa kuah dulu, lalu taruh sampah organik di wadah terpisah. Bonus: bisa jadi pupuk alami!",
      "😊 Sampah organik bisa kembali ke tanah. Pisahkan, lalu olah jadi kompos sederhana.",
      "🧪 Sampah organik tertentu bisa dipakai untuk eco-enzyme (dengan bimbingan orang dewasa ya)."
    ]
  },

  // PENTING: label ML kamu = "recycle"
  recycle: {
    title: "Sampah Daur Ulang ♻️",
    tips: [
      "♻️ Ini sampah daur ulang! Kosongkan, bilas, dan keringkan sebelum dibuang ya.",
      "🧴 Kalau ini botol/kemasan: bilas cepat biar bersih, lalu geprek supaya hemat tempat!",
      "📦 Pisahkan dari sisa makanan. Sampah yang bersih lebih mudah didaur ulang.",
      "🏡 Kumpulkan kemasan bersih lalu masukkan ke tempat sampah daur ulang / bank sampah.",
      "🎨 Bisa jadi kerajinan juga! Pastikan aman dan tidak ada bagian tajam ya."
    ]
  },

  // (boleh tetap ada, tidak ganggu)
  anorganik: {
    title: "Sampah Anorganik",
    tips: [
      "Sampah anorganik dapat didaur ulang.",
      "Pisahkan plastik, kertas, dan logam.",
      "Bersihkan sebelum didaur ulang."
    ]
  },

  b3: {
    title: "Sampah B3",
    tips: [
      "Sampah B3 berbahaya bagi lingkungan.",
      "Buang sesuai prosedur khusus.",
      "Jangan dicampur dengan sampah lain."
    ]
  }
};

/**
 * Ambil 1 info secara acak berdasarkan label
 */
function getSampahInfo(label) {
  const data = sampahInfo[label];

  if (!data) {
    return "Informasi pengolahan tidak tersedia.";
  }

  const randomTip =
    data.tips[Math.floor(Math.random() * data.tips.length)];

  return randomTip;
}

module.exports = {
  getSampahInfo
};
