const express = require("express");
const { register, pause, resume, getRegistro } = require("../controllers/registroController");

const router = express.Router();

router.post("/register", register);
router.post("/pause", pause);
router.post("/resume", resume);
router.get("/registro/:usuario", getRegistro);

module.exports = router;
