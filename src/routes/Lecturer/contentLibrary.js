const express = require("express");
const {
  authenticateJWT,
} = require("../../middlewares/authMiddleware/authenticationMiddleware");
const {
  contentCredentials,
} = require("../../middlewares/multerProfileMiddleware");
const {
  createCourse,
  addSectionToCourse,
  addContentToSection,
  allContent,
  singleContent,
  updateContent,
  deleteContent,
} = require("../../controllers/LecturerController/ContentLibraryController");
const contentRouter = express.Router();

contentRouter.post("/create-course", authenticateJWT, createCourse);
contentRouter.post(
  "/add-section/:courseId",
  authenticateJWT,
  addSectionToCourse
);
contentRouter.post(
  "/add-content/:courseId/:sectionId",
  authenticateJWT,
  contentCredentials,
  addContentToSection
);
contentRouter.get("/all-content", authenticateJWT, allContent);
contentRouter.get("/single-content/:id", authenticateJWT, singleContent);
contentRouter.put(
  "/update-content/:courseId/:sectionId/:contentId",
  authenticateJWT,
  contentCredentials,
  updateContent
);
contentRouter.delete(
  "/delete-content/:courseId/:sectionId/:contentId",
  authenticateJWT,
  deleteContent
);

module.exports = contentRouter;
