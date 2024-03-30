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
  const { old_password, new_password, confirm_new_password } = request.body;
  const student_id = request.user.studentId;
  if (!student_id) {
    return response.status(403).json({ message: "Unauthorized User" });
  }
  try {
    const validationRules = [
      body("old_password").notEmpty().withMessage("Old Password is required"),
      body("new_password")
        .isLength({ min: 10 })
        .withMessage("Password must be at least 16 characters long"),
      body("confirm_new_password")
        .isLength({ min: 10 })
        .withMessage("Confirm Password must be at least 16 characters long"),
    ];

    // Apply validation rules to the request
    await Promise.all(validationRules.map((rule) => rule.run(request)));

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const student = await Student.findOne({ _id: student_id });
    if (!student) {
      return response.status(404).json({ message: "Student Not Found" });
    }
    const password = student.password;

    if (password !== null) {
      // Verify the password
      const passwordMatch = await bcrypt.compare(old_password, password);

      if (!passwordMatch) {
        return response.status(401).json({ error: "Old Password Mismatch" });
      }
    }

    if (new_password !== confirm_new_password) {
      return response.status(401).json({ error: "Password Mismatch" });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(new_password, 10);
    const update = await Student.findOneAndUpdate(
      { _id: student_id },
      { password: hashedPassword },
      { new: true }
    );

    return response
      .status(200)
      .json({ message: "Password Updated Successfully", data: update });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ message: "Internal Server Error" });
  }
}

async function changeProfileImage(request, response) {
  const student_id = request.user.studentId;

  // Check if user_id is not present or undefined
  if (!student_id) {
    return response.status(403).json({ message: "Unauthorized User" });
  }
  try {
    // Retrieve the user by user_id
    const student = await Student.findById({ _id: student_id });
    if (!student) {
      return response.status(404).json({ message: "Student Not Found" });
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
      return response.status(400).json({ message: "No file uploaded" });
    }

    const student_updated = await Student.findOneAndUpdate(
      { _id: student_id },
      { profile_image },
      { new: true }
    );
    return response.status(200).json({
      message: "Student profile image updated",
      data: student_updated,
    });
  } catch (error) {
    return response.status(500).json({ message: error });
  }
}

async function updateDetails(request, response) {
  const { fullname, phone_number } = request.body;
  const student_id = request.user.studentId;

  // Check if user_id is not present or undefined
  if (!student_id) {
    return response.status(403).json({ message: "Unauthorized User" });
  }
  try {
    const validationRules = [
      body("fullname").notEmpty().withMessage("Full Name is required"),
      body("phone_number").notEmpty().withMessage("Phone number is required"),
    ];

    // Apply validation rules to the request
    await Promise.all(validationRules.map((rule) => rule.run(request)));

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    // Retrieve the user by user_id
    const student = await Student.findById({ _id: student_id });
    if (!student) {
      return response.status(404).json({ message: "Student Not Found" });
    }

    const user = await Student.findOneAndUpdate(
      { _id: student_id },
      { fullname, phone_number },
      { new: true }
    );

    return response
      .status(200)
      .json({ message: "Student profile updated", data: user });
  } catch (error) {
    return response.status(500).json({ message: error });
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await Student.findOne({ email });

    if (!user) {
      return next(createError(404, `User with email ${email} does not exist`));
    }

    const resetToken = jwt.sign({ email: user.email }, Config.Jwt_secret, {
      expiresIn: "10m",
    });

    await sendResetPasswordEmail(user.email, user, resetToken);

    res.status(200).json({
      success: true,
      message: "Reset token generated and sent to your email.",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { resetToken } = req.params;
    let { password } = req.body;

    const decoded = jwt.verify(resetToken, Config.JWT_SECRET);
    const user = await Student.findOne({ email: decoded.email });

    if (!user) {
      return next(createError(404, "User not found"));
    }

    password = await bcrypt.hash(password, 10);
    user.password = password;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  changePassword,
  changeProfileImage,
  updateDetails,
  forgotPassword,
  resetPassword,
};
