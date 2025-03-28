const express = require("express");
const { upsertJustificativa, deleteJustificativa } = require("../controllers/justificativaController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.put("/", authMiddleware, upsertJustificativa);
router.delete("/", authMiddleware, deleteJustificativa);


module.exports = router;
