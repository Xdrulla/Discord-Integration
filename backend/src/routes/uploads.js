const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/justificativas";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeName = file.originalname.replace(/\s+/g, "_").replace(/[^\w.]/gi, "");
    cb(null, `${Date.now()}_${safeName}`);
  },
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Tipo de arquivo não suportado."), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, error: "Arquivo excede o limite de 5MB." });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: "Nenhum arquivo enviado." });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/justificativas/${file.filename}`;
    res.json({
      success: true,
      url: fileUrl,
      filename: file.originalname,
      mimetype: file.mimetype,
    });
  });
});

module.exports = router;
