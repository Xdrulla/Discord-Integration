const express = require("express");
const { upsertJustificativa } = require("../controllers/justificativaController");
const router = express.Router();

router.put("/", upsertJustificativa);

module.exports = router;
