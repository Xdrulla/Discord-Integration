const express = require("express");
const registroRoutes = require("./registroRoutes");
const justificativaRoutes = require("./justificativaRoutes");

const router = express.Router();

router.use("/justificativa", justificativaRoutes);
router.use("/", registroRoutes);

module.exports = router;
