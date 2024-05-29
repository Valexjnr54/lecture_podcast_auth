const express = require("express");
const {
  searchLecturers,
  searchStudents,
  searchCourses,
} = require("../controllers/SearchController/searchController");

const router = express.Router();

router.get("/lecturers", searchLecturers);
router.get("/students", searchStudents);
router.get("/courses", searchCourses);

module.exports = router;
