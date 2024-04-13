const { validationResult, body } = require("express-validator");
const createError = require("http-errors");
const bcrypt = require("bcrypt");
const { Request, Response } = require("express");
const Lecturer = require("../../models/LecturerModel");
const ContentLibrary = require("../../models/contentLibrary");
const {
  uploadImage,
  uploadVideo,
  uploadAudio,
  uploadFile,
} = require("../../utils/cloudinary");
const { isDocumentFile } = require("../../services/verification");
const fs = require("fs");

async function changePassword(request, response) {
  const { old_password, new_password } = request.body;
  const lecturer_id = request.user.lecturerId;
  if (!lecturer_id) {
    return response.status(403).json({ status: 403, message: "Unauthorized User" });
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

    const lecturer = await Lecturer.findOne({ _id: lecturer_id });
    if (!lecturer) {
      return response.status(404).json({ status: 404, message: "Lecturer Not Found" });
    }
    const password = lecturer.password;

    if (password !== null) {
      // Verify the password
      const passwordMatch = await bcrypt.compare(old_password, password);

      if (!passwordMatch) {
        return response.status(401).json({ error: "Old Password Mismatch" });
      }
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(new_password, 10);
    const update = await Lecturer.findOneAndUpdate(
      { _id: lecturer_id },
      { password: hashedPassword },
      { new: true }
    );

    return response
      .status(200)
      .json({ status: 200, message: "Password Updated Successfully", data: update });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ status: 500, message: "Internal Server Error" });
  }
}

async function changeProfileImage(request, response) {
  const lecturer_id = request.user.lecturerId;

  // Check if user_id is not present or undefined
  if (!lecturer_id) {
    return response.status(403).json({ status: 403, message: "Unauthorized User" });
  }
  try {
    // Retrieve the user by user_id
    const lecturer = await Lecturer.findById({ _id: lecturer_id });
    if (!lecturer) {
      return response.status(404).json({ status: 404, message: "Lecturer Not Found" });
    }

    // Uploading Image to Cloudinary
    let profile_image; // Default URL
    if (request.file) {
      const profile_image_path = request.file.path; // Assuming you're using multer or a similar middleware for file uploads
      if (profile_image_path != null) {
        const uploadedImageUrl = await uploadImage(
          profile_image_path,
          "lecture_podcast/images/lecturer_passports"
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
      return response.status(400).json({ status: 400, message: "No file uploaded" });
    }

    const lecturer_updated = await Lecturer.findOneAndUpdate(
      { _id: lecturer_id },
      { profile_image },
      { new: true }
    );
    return response.status(200).json({
      status: 200, message: "Lecturer profile image updated",
      data: lecturer_updated,
    });
  } catch (error) {
    return response.status(500).json({ status: 500, message: error });
  }
}

async function updateDetails(request, response) {
  const { fullname, phone_number } = request.body;
  const lecturer_id = request.user.lecturerId;

  // Check if user_id is not present or undefined
  if (!lecturer_id) {
    return response.status(403).json({ status: 403, message: "Unauthorized User" });
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
    const lecturer = await Lecturer.findById({ _id: lecturer_id });
    if (!lecturer) {
      return response.status(404).json({ status: 404, message: "Lecturer Not Found" });
    }

    const user = await Lecturer.findOneAndUpdate(
      { _id: lecturer_id },
      { fullname, phone_number },
      { new: true }
    );

    return response
      .status(200)
      .json({ status: 200, message: "Lecturer profile updated", data: user });
  } catch (error) {
    return response.status(500).json({ status: 500, message: error });
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await Lecturer.findOne({ email });

    if (!user) {
      return next(createError(404, `User with email ${email} does not exist`));
    }

    const resetToken = jwt.sign({ email: user.email }, Config.Jwt_secret, {
      expiresIn: "12m",
    });

    await sendResetPasswordEmail(user.email, user, resetToken, "lecturer");

    res.status(200).json({
      success: true,
      status: 200, message: "Reset token generated and sent to your email.", data:user
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { resetToken } = req.params;
    let { password } = req.body;

    const decoded = jwt.verify(resetToken, Config.Jwt_secret);
    const user = await Lecturer.findOne({ email: decoded.email });
    console.log(user);

    if (!user) {
      return next(createError(404, "User not found"));
    }

    user.password = password;
    await user.save();

    res
      .status(200)
      .json({ success: true, status: 200, message: "Password reset successful" });
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
