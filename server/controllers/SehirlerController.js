const Sehirler = require('../models/Sehirler');

// Tüm şehirleri döndürür
exports.getAllSehirler = async (req, res) => {
  try {
    const sehirler = await Sehirler.getAllSehirler();
    res.json(sehirler);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
