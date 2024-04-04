const express = require("express");

const {
  allContent,
  singleContent,
} = require("../../controllers/Contents/contentsController");

const router = express.Router();

router.get("/all-content", allContent);

router.get("/single-content", singleContent);

module.exports = router;
