// services/sampahInfo.js

const sampahInfo = {
  organik: {
    title: "Sampah Organik",
    tips: [
      "Sampah organik bisa dijadikan kompos.",
      "Dapat diolah menjadi pupuk alami.",
      "Cocok untuk eco-enzyme."
    ]
  },
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
