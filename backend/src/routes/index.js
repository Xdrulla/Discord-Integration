const express = require("express");
const registroRoutes = require("./registroRoutes");
const justificativaRoutes = require("./justificativaRoutes");
const specialDateRoutes = require("./specialDateRoutes");
const uploadRoute = require("./uploads");
const aiRoutes = require("./aiRoutes");

const router = express.Router();

router.use("/justificativa", justificativaRoutes);
router.use("/datas-especiais", specialDateRoutes);
router.use("/upload-justificativa", uploadRoute);
router.use("/", registroRoutes);
router.use("/ai", aiRoutes);

module.exports = router;
