const express = require("express");
const registroRoutes = require("./registroRoutes");
const justificativaRoutes = require("./justificativaRoutes");
const feriadoRoutes = require("./feriadoRoutes");

const router = express.Router();

router.use("/justificativa", justificativaRoutes);
router.use("/datas-especiais", feriadoRoutes); 
router.use("/", registroRoutes);

module.exports = router;
