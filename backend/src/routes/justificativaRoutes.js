const express = require("express");
const { upsertJustificativa } = require("../controllers/justificativaController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.put("/", authMiddleware, upsertJustificativa);

module.exports = router;
