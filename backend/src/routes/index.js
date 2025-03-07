const express = require("express");
const registroRoutes = require("./registroRoutes");

const router = express.Router();

router.use("/registros", registroRoutes);

module.exports = router;
