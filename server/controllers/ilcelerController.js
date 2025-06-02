const Ilceler = require('../models/Ilceler');

// Seçilen şehre ait ilçeleri döndürür
exports.getIlcelerBySehirAd = async (req, res) => {
    try {
      const sehirAd = req.params.sehirAd;
      const ilceler = await Ilceler.getIlcelerBySehirAd(sehirAd);
      res.json(ilceler);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };