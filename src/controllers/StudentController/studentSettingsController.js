const jwt = require("jsonwebtoken");
const { validationResult, body } = require("express-validator");
const createError = require("http-errors");
const bcrypt = require("bcrypt");
const { Request, Response } = require("express");
const Student = require("../../models/StudentModel");
const ContentLibrary = require("../../models/contentLibrary");
const {
  uploadImage,
  uploadVideo,
  uploadAudio,
  uploadFile,
} = require("../../utils/cloudinary");
const { sendResetPasswordEmail } = require("../../utils/emailSender");
const { isDocumentFile } = require("../../services/verification");
const { Config } = require("../../config/config");
const fs = require("fs");

async function changePassword(request, response) {
  const { old_password, new_password } = request.body;
  const student_id = request.user.studentId;
  if (!student_id) {
    return response
      .status(403)
      .json({ status: 403, message: "Unauthorized User" });
  }
  try {
    const validationRules = [
      body("old_password").notEmpty().withMessage("Old Password is required"),
      body("new_password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),
    ];

    // Apply validation rules to the request
    await Promise.all(validationRules.map((rule) => rule.run(request)));

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const student = await Student.findOne({ _id: student_id });
    if (!student) {
      return response
        .status(404)
        .json({ status: 404, message: "Student Not Found" });
    }
    const password = student.password;

    if (password !== null) {
      // Verify the password
      const passwordMatch = await bcrypt.compare(old_password, password);

      if (!passwordMatch) {
        return response.status(401).json({ error: "Old Password Mismatch" });
      }
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(new_password, 10);
    const update = await Student.findOneAndUpdate(
      { _id: student_id },
      { password: hashedPassword },
      { new: true }
    );

    return response.status(200).json({
      status: 200,
      message: "Password Updated Successfully",
      data: update,
    });
  } catch (error) {
    console.log(error);
    return response
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
}

async function changeProfileImage(request, response) {
  const student_id = request.user.studentId;

  // Check if user_id is not present or undefined
  if (!student_id) {
    return response
      .status(403)
      .json({ status: 403, message: "Unauthorized User" });
  }
  try {
    // Retrieve the user by user_id
    const student = await Student.findById({ _id: student_id });
    if (!student) {
      return response
        .status(404)
        .json({ status: 404, message: "Student Not Found" });
    }

    // Uploading Image to Cloudinary
    let profile_image; // Default URL
    if (request.file) {
      const profile_image_path = request.file.path; // Assuming you're using multer or a similar middleware for file uploads
      if (profile_image_path != null) {
        const uploadedImageUrl = await uploadImage(
          profile_image_path,
          "lecture_podcast/images/student_passports"
        );
        if (uploadedImageUrl) {
          profile_image = uploadedImageUrl;
        }
      }

      fs.unlink(profile_image_path, (err) => {
        if (err) {
          console.error(`Error deleting file: ${profile_image_path}`);
        } else {
          console.log(`File deleted: ${profile_image_path}`);
        }
      });
    } else {
      return response
        .status(400)
        .json({ status: 400, message: "No file uploaded" });
    }

    const student_updated = await Student.findOneAndUpdate(
      { _id: student_id },
      { profile_image },
      { new: true }
    );
    return response.status(200).json({
      status: 200,
      message: "Student profile image updated",
      data: student_updated,
    });
  } catch (error) {
    return response.status(500).json({ status: 500, message: error });
  }
}

async function updateDetails(request, response) {
  const { address, phone_number, level, course, university } = request.body;
  const student_id = request.user.studentId;

  if (!student_id) {
    return response
      .status(403)
      .json({ status: 403, message: "Unauthorized User" });
  }
  try {
    const validationRules = [
      body("address").notEmpty().withMessage("Address is required"),
      body("phone_number").notEmpty().withMessage("Phone number is required"),
      body("level").notEmpty().withMessage("Level is required"),
      body("course").notEmpty().withMessage("Course is required"),
      body("university").notEmpty().withMessage("University is required"),
    ];

    await Promise.all(validationRules.map((rule) => rule.run(request)));

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const student = await Student.findById({ _id: student_id });
    if (!student) {
      return response
        .status(404)
        .json({ status: 404, message: "Student Not Found" });
    }

    const user = await Student.findOneAndUpdate(
      { _id: student_id },
      { address, phone_number, level, course, university },
      { new: true }
    );

    return response
      .status(200)
      .json({ status: 200, message: "Student profile updated", data: user });
  } catch (error) {
    return response.status(500).json({ status: 500, message: error });
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await Student.findOne({ email });

    if (!user) {
      // return next(createError(404, `User with email ${email} does not exist`));
      return res.status(404).json({
        status: 404,
        message: `User with email ${email} does not exist`,
      });
    }

    const resetToken = jwt.sign({ email: user.email }, Config.Jwt_secret, {
      expiresIn: "12m",
    });

    await sendResetPasswordEmail(user.email, user, resetToken, "student");

    res.status(200).json({
      success: true,
      status: 200,
      message: "Reset token generated and sent to your email.",
      data: user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error", data: { error } });

    // next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { resetToken } = req.params;
    let { password } = req.body;

    const decoded = jwt.verify(resetToken, Config.Jwt_secret);
    const user = await Student.findOne({ email: decoded.email });
    console.log(user);

    if (!user) {
      // return next(createError(404, "User not found"));
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    user.password = password;
    await user.save();

    res.status(200).json({
      success: true,
      status: 200,
      message: "Password reset successful",
      data: user,
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error", data: { error } });
    // next(error);
  }
};

module.exports = {
  changePassword,
  changeProfileImage,
  updateDetails,
  forgotPassword,
  resetPassword,
};
