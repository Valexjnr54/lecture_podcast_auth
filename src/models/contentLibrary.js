const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ContentSchema = new Schema({
  content_type: {
    type: String,
    required: true,
    enum: ["Video", "Audio", "File", "Presentation"],
  },
  content_url: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  duration: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const SectionSchema = new Schema({
  section_title: {
    type: String,
    required: true,
  },
  contents: [ContentSchema],
});

const CourseSchema = new Schema({
  lecturer_id: {
    type: String,
    required: true,
  },
  lecturer_name: {
    type: String,
    required: true,
  },
  course_title: {
    type: String,
    required: true,
  },
  course_code: {
    type: String,
    default: null,
  },
  content_category: {
    type: String,
    required: true,
    enum: ["lecture", "assignment", "quiz", "discussion", "science", "art"],
  },
  sections: [SectionSchema],
});

const ContentLibrary = mongoose.model("content_library", CourseSchema);

module.exports = ContentLibrary;
