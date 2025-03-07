const express = require("express");
const { register, pause, resume } = require("../controllers/registroController");

const router = express.Router();

router.post("/register", register);
router.post("/pause", pause);
router.post("/resume", resume);

module.exports = router;
