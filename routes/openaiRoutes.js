const express = require("express");
const router = express.Router();
const { generatePpt } = require("../controllers/openaiController");

router.post("/generate-ppt", generatePpt);

module.exports = router;