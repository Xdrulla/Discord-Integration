const express = require("express");
const {
  getDatasEspeciais,
  addDataEspecial,
  deleteDataEspecial,
} = require("../controllers/specialDateController");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getDatasEspeciais);
router.post("/", authMiddleware, addDataEspecial);
router.delete("/:data", authMiddleware, deleteDataEspecial);

module.exports = router;
