const Lecturer = require("../../models/LecturerModel");
const Course = require("../../models/contentLibrary");
const Student = require("../../models/StudentModel");

const searchLecturers = async (req, res) => {
  try {
    const { query } = req.query;
    const lecturers = await Lecturer.find({
      $or: [
        { fullname: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { area_of_expertise: { $regex: query, $options: "i" } },
      ],
    });

    if (lecturers.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No lecturers found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Lecturers found",
      data: lecturers,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error,
    });
  }
};

const searchStudents = async (req, res) => {
  try {
    const { query } = req.query;
    const students = await Student.find({
      $or: [
        { fullname: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { department: { $regex: query, $options: "i" } },
      ],
    });

    if (students.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No students found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Students found",
      data: students,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error,
    });
  }
};

const searchCourses = async (req, res) => {
  try {
    const { query } = req.query;
    const courses = await Course.find({
      $or: [
        { course_title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });

    if (courses.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No courses found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Courses found",
      data: courses,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error,
    });
  }
};

module.exports = { searchLecturers, searchStudents, searchCourses };
