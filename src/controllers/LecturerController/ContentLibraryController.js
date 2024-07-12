const { validationResult, body } = require("express-validator");
const createError = require("http-errors");
const Lecturer = require("../../models/LecturerModel");
const ContentLibrary = require("../../models/contentLibrary");
const {
  uploadImage,
  uploadVideo,
  uploadAudio,
  uploadFile,
} = require("../../utils/cloudinary");
const fs = require("fs");

async function createCourse(request, response) {
  const { course_title, course_code, content_category } = request.body;
  const lecturer_id = request.user.lecturerId;

  try {
    const validationRules = [
      body("course_title").notEmpty().withMessage("Course Title is required"),
      body("content_category")
        .notEmpty()
        .withMessage("Content Category is required"),
    ];

    await Promise.all(validationRules.map((rule) => rule.run(request)));

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const lecturer = await Lecturer.findOne({ _id: lecturer_id });
    if (!lecturer) {
      return response
        .status(404)
        .json({ status: 404, message: "Lecturer Not Found" });
    }

    const course = new ContentLibrary({
      lecturer_id,
      lecturer_name: lecturer.fullname,
      course_title,
      course_code,
      content_category,
      sections: [],
    });

    await course.save();
    return response.status(201).json({
      status: 201,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
}

async function addSectionToCourse(request, response) {
  const { section_title } = request.body;
  const lecturer_id = request.user.lecturerId;
  const courseId = request.params.courseId;

  try {
    const validationRules = [
      body("section_title").notEmpty().withMessage("Section Title is required"),
    ];

    await Promise.all(validationRules.map((rule) => rule.run(request)));

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const course = await ContentLibrary.findOne({ _id: courseId, lecturer_id });
    if (!course) {
      return response
        .status(404)
        .json({ status: 404, message: "Course Not Found" });
    }

    const section = {
      section_title,
      contents: [],
    };

    course.sections.push(section);
    await course.save();

    return response.status(201).json({
      status: 201,
      message: "Section added successfully",
      data: course,
    });
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
}

async function addContentToSection(request, response) {
  const { descriptions, durations, content_types } = request.body;
  const lecturer_id = request.user.lecturerId;
  const courseId = request.params.courseId;
  const sectionId = request.params.sectionId;

  try {
    const validationRules = [
      body("content_types")
        .isArray()
        .withMessage("Content Types are required and must be an array"),
      body("descriptions")
        .isArray()
        .withMessage("Descriptions are required and must be an array"),
      body("durations")
        .isArray()
        .withMessage("Durations are required and must be an array"),
    ];

    await Promise.all(validationRules.map((rule) => rule.run(request)));

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const course = await ContentLibrary.findOne({ _id: courseId, lecturer_id });
    if (!course) {
      return response
        .status(404)
        .json({ status: 404, message: "Course Not Found" });
    }

    const section = course.sections.id(sectionId);
    if (!section) {
      return response
        .status(404)
        .json({ status: 404, message: "Section Not Found" });
    }

    const contents = [];
    const files = {
      videos: request.files.videos || [],
      audios: request.files.audios || [],
      documents: request.files.documents || [],
    };

    let fileIndex = 0;
    for (let i = 0; i < content_types.length; i++) {
      let file;
      let content_url;
      let thumbnail = null;

      if (content_types[i] === "Video") {
        file = files.videos[fileIndex];
        content_url = await uploadVideo(
          file.path,
          "lecture_podcast/videos/content_library_videos"
        );
      } else if (content_types[i] === "Audio") {
        file = files.audios[fileIndex];
        content_url = await uploadAudio(
          file.path,
          "lecture_podcast/audio/content_library_audios"
        );
      } else if (content_types[i] === "File") {
        file = files.documents[fileIndex];
        content_url = await uploadFile(
          file.path,
          "lecture_podcast/documents/content_library_documents"
        );
      }

      if (request.files.thumbnails && request.files.thumbnails[i]) {
        thumbnail = await uploadImage(
          request.files.thumbnails[i].path,
          "lecture_podcast/thumbnails/content_library_thumbnails"
        );
      }

      fs.unlink(file.path, (err) => {
        if (err) {
          console.error(`Error deleting ${content_types[i]} file`);
        }
      });

      contents.push({
        content_type: content_types[i],
        content_url,
        description: descriptions[i],
        duration: durations[i],
        thumbnail,
      });

      fileIndex++;
    }

    section.contents.push(...contents);
    await course.save();

    return response.status(201).json({
      status: 201,
      message: "Contents added successfully",
      data: course,
    });
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
}

async function allContent(request, response) {
  const lecturer_id = request.user.lecturerId;
  try {
    const lecturer = await Lecturer.findOne({ _id: lecturer_id });
    if (!lecturer)
      return response
        .status(404)
        .json({ status: 404, message: "Lecturer Not Found" });

    const courses = await ContentLibrary.find({ lecturer_id });
    if (!courses)
      return response
        .status(404)
        .json({ status: 404, message: "Lecturer has no content yet" });

    return response.status(200).json({
      status: 200,
      message: "Contents Fetch successfully",
      data: courses,
    });
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
}

async function singleContent(request, response) {
  const lecturer_id = request.user.lecturerId;
  const _id = request.params.id;
  try {
    const lecturer = await Lecturer.findOne({ _id: lecturer_id });
    if (!lecturer)
      return response
        .status(404)
        .json({ status: 404, message: "Lecturer Not Found" });

    const course = await ContentLibrary.findOne({ _id, lecturer_id });
    if (!course)
      return response
        .status(404)
        .json({ status: 404, message: "Course Not Found" });

    return response.status(200).json({
      status: 200,
      message: "Content Fetched successfully",
      data: course,
    });
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
}

async function updateContent(request, response) {
  const { content_type, description, duration } = request.body;
  const lecturer_id = request.user.lecturerId;
  const courseId = request.params.courseId;
  const sectionId = request.params.sectionId;
  const contentId = request.params.contentId;

  try {
    const validationRules = [
      body("content_type").notEmpty().withMessage("Content Type is required"),
    ];

    await Promise.all(validationRules.map((rule) => rule.run(request)));

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const course = await ContentLibrary.findOne({ _id: courseId, lecturer_id });
    if (!course)
      return response
        .status(404)
        .json({ status: 404, message: "Course Not Found" });

    const section = course.sections.id(sectionId);
    if (!section)
      return response
        .status(404)
        .json({ status: 404, message: "Section Not Found" });

    const content = section.contents.id(contentId);
    if (!content)
      return response
        .status(404)
        .json({ status: 404, message: "Content Not Found" });

    let content_url = content.content_url;
    let thumbnail = content.thumbnail;

    if (content_type === "Video" && request.files && request.files.video) {
      const videoFile = request.files.video;
      content_url = await uploadVideo(
        videoFile[0].path,
        "lecture_podcast/videos/content_library_videos"
      );
      fs.unlink(videoFile[0].path, (err) => {
        if (err) {
          console.error(`Error deleting Content Video file`);
        }
      });

      if (request.files.thumbnail) {
        thumbnail = await uploadImage(
          request.files.thumbnail[0].path,
          "lecture_podcast/thumbnails/content_library_thumbnails"
        );
        fs.unlink(request.files.thumbnail[0].path, (err) => {
          if (err) {
            console.error(`Error deleting Thumbnail Image file`);
          }
        });
      }
    } else if (
      content_type === "Audio" &&
      request.files &&
      request.files.audio
    ) {
      const audioFile = request.files.audio;
      content_url = await uploadAudio(
        audioFile[0].path,
        "lecture_podcast/audio/content_library_audios"
      );
      fs.unlink(audioFile[0].path, (err) => {
        if (err) {
          console.error(`Error deleting Content Audio file`);
        }
      });

      if (request.files.thumbnail) {
        thumbnail = await uploadImage(
          request.files.thumbnail[0].path,
          "lecture_podcast/thumbnails/content_library_thumbnails"
        );
        fs.unlink(request.files.thumbnail[0].path, (err) => {
          if (err) {
            console.error(`Error deleting Thumbnail Image file`);
          }
        });
      }
    } else if (
      content_type === "File" &&
      request.files &&
      request.files.document
    ) {
      const uploadedFile = request.files.document;
      content_url = await uploadFile(
        uploadedFile[0].path,
        "lecture_podcast/documents/content_library_documents"
      );
      fs.unlink(uploadedFile[0].path, (err) => {
        if (err) {
          console.error(`Error deleting Content Document file`);
        }
      });

      if (request.files.thumbnail) {
        thumbnail = await uploadImage(
          request.files.thumbnail[0].path,
          "lecture_podcast/thumbnails/content_library_thumbnails"
        );
        fs.unlink(request.files.thumbnail[0].path, (err) => {
          if (err) {
            console.error(`Error deleting Thumbnail Image file`);
          }
        });
      }
    }

    content.content_type = content_type;
    content.content_url = content_url;
    content.description = description;
    content.duration = duration;
    content.thumbnail = thumbnail;

    await course.save();

    return response.status(200).json({
      status: 200,
      message: "Content updated successfully",
      data: course,
    });
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
}

async function deleteContent(request, response) {
  const lecturer_id = request.user.lecturerId;
  const courseId = request.params.courseId;
  const sectionId = request.params.sectionId;
  const contentId = request.params.contentId;

  try {
    const course = await ContentLibrary.findOne({ _id: courseId, lecturer_id });
    if (!course)
      return response
        .status(404)
        .json({ status: 404, message: "Course Not Found" });

    const section = course.sections.id(sectionId);
    if (!section)
      return response
        .status(404)
        .json({ status: 404, message: "Section Not Found" });

    const content = section.contents.id(contentId);
    if (!content)
      return response
        .status(404)
        .json({ status: 404, message: "Content Not Found" });

    content.remove();
    await course.save();

    return response.status(200).json({
      status: 200,
      message: "Content deleted successfully",
      data: course,
    });
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
}

module.exports = {
  createCourse,
  addSectionToCourse,
  addContentToSection,
  allContent,
  singleContent,
  updateContent,
  deleteContent,
};
