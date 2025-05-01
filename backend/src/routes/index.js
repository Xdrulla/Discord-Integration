const express = require("express");
const registroRoutes = require("./registroRoutes");
const justificativaRoutes = require("./justificativaRoutes");
const specialDateRoutes = require("./specialDateRoutes");

const router = express.Router();

router.use("/justificativa", justificativaRoutes);
router.use("/datas-especiais", specialDateRoutes);
router.use("/", registroRoutes);

module.exports = router;
