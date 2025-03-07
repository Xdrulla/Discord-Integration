const express = require("express");
const registroRoutes = require("./registroRoutes");

const router = express.Router();

router.use("/", registroRoutes);

module.exports = router;
