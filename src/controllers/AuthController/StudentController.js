const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const Student = require("../../models/StudentModel");
const Lecturer = require("../../models/LecturerModel");

const {
  studentAuthSchema,
  loginSchema,
} = require("../../helpers/validation_schema");
const {
  signAccessToken,
  signRefreshToken,
  logoutToken,
} = require("../../helpers/jwt_helper");
const { Config } = require("../../config/config");
const { sendVerificationEmail } = require("../../utils/emailSender");

const generateVerificationToken = (email) => {
  return jwt.sign({ email: email }, Config.Jwt_secret, {
    expiresIn: "1d", // Token expires in 1 day
  });
};

const generateVerificationTokenExpiry = () => {
  return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
};

const registerStudent = async (request, response, next) => {
  try {
    const result = await studentAuthSchema.validateAsync(request.body);

    const lecturer = await Lecturer.findOne({ email: result.email });
    if (lecturer) {
      // throw createError.Conflict(
      //   `You cannot register as a student using a lecturer's email.`
      // );
      return response.status(400).json({
        status: 400,
        message: `You cannot register as a student using a lecturer's email.`,
      });
    }

    const doesExist = await Student.findOne({ email: result.email });
    // if (doesExist) throw createError.Conflict(`${result.email} already exist`);
    if (doesExist) {
      return response.status(400).json({
        status: 400,
        message: `${result.email} already exist`,
      });
    }

    // Generate a verification token
    const verificationToken = jwt.sign(
      { email: result.email },
      Config.Jwt_secret,
      {
        expiresIn: "1d", // Token expires in 1 day
      }
    );

    // Save the verification token with the user data
    const student = new Student({
      ...result,
      verificationToken,
    });

    const savedStudent = await student.save();

    // Send verification email
    await sendVerificationEmail(savedStudent, verificationToken, "student");

    response
      .status(201)
      .json({ data: savedStudent, success: true, status: 201 });
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    response
      .status(error.status || 500)
      .json({ message: error.message, success: false, status: error.status });
    // next(error);
  }
};

const loginStudent = async (request, response, next) => {
  try {
    const result = await loginSchema.validateAsync(request.body);
    const student = await Student.findOne({ email: result.email });

    const lecturer = await Lecturer.findOne({ email: result.email });
    if (lecturer) {
      // throw createError.Unauthorized(
      //   `Unauthorized. We found out that you are a lecturer. Please login to the web as a lecturer.`
      // );
      return response.status(400).json({
        status: 400,
        message: `Unauthorized. We found out that you are a lecturer. Please login to the web as a lecturer.`,
      });
    }

    if (!student) throw createError.Unauthorized(`Unauthorized Student`);

    // Check if the email is verified
    if (!student.isVerified) {
      // throw createError.Unauthorized(
      //   `Email not verified. Please check your inbox for the verificat ion email.`
      // );
      return response.status(400).json({
        status: 400,
        message: `Email not verified. Please check your inbox for the verification email.`,
      });
    }

    const isMatch = await student.isValidPassword(result.password);
    if (!isMatch) {
      // throw createError.Unauthorized("Invalid Email/Password");
      return response.status(400).json({
        status: 400,
        message: `Invalid Email/Password`,
      });
    }
    if (!Config.Jwt_secret) {
      console.error("Jwt_secret is not defined!");
      res
        .status(500)
        .json({ status: 500, data: {}, message: "Internal Server Error" });
      return;
    }
    // Generate a JWT token for the logged-in student
    const verificationToken = jwt.sign(
      {
        studentId: student._id,
        email: student.email,
        fullname: student.fullname,
      },
      Config.Jwt_secret
    );

    student.verificationToken = verificationToken;

    response.status(201).json({ data: student, success: true, status: 201 });
  } catch (error) {
    if (error.isJoi === true)
      // return next(createError.BadRequest("Invalid Email/Password"));
      return response.status(400).json({
        status: 400,
        message: `Invalid Email/Password`,
      });
    // next(error);
  }
};

const logoutStudent = async (request, response, next) => {
  try {
    if (!request.headers["authorization"])
      // next(createError.Unauthorized("Unauthorized Student"));
      return response.status(400).json({
        status: 400,
        message: `Unauthorized Student`,
      });
    const authHeader = request.headers["authorization"];
    const bearerToken = authHeader.split(" ");
    const token = bearerToken[1];
    if (!token) return response.status(400).send("Token not provided");

    // Add token to blacklist
    logoutToken(token);

    response.send("Logged out successfully");
  } catch (error) {
    // Handle any potential errors that may occur during the logout process.
    console.error("Error during logout:", error);
    response
      .status(500)
      .json({ status: 500, data: {}, message: "Internal Server Error" });
  }
};

const profileStudent = async (request, response, next) => {
  try {
    const userId = request.user.studentId;
    const student = await Student.findOne({ _id: userId });
    if (!student) throw createError.NotFound(`Student Not Found`);
    response.status(200).json({
      status: 200,
      message: "Student Profile Fetched Successfully",
      data: student,
    });
  } catch (error) {
    console.log(error);
    response
      .status(500)
      .json({ status: 500, data: {}, message: "Internal Server Error" });
  }
};

const verifyEmail = async (request, response, next) => {
  try {
    const { token } = request.query;
    const decoded = jwt.verify(token, Config.Jwt_secret);
    const student = await Student.findOne({ email: decoded.email });

    if (!student) {
      // throw createError.NotFound("User not found");
      return response
        .status(404)
        .json({ status: 404, message: "User not found" });
    }

    if (student.isVerified) {
      return response
        .status(400)
        .json({ status: 400, message: "Email is already verified." });
    }

    // Check if the verification token has expired
    const currentTime = new Date();
    const tokenExpiration = new Date(decoded.exp * 1000); // Convert seconds to milliseconds
    if (currentTime > tokenExpiration) {
      // throw createError.BadRequest("Verification token has expired");
      return response
        .status(400)
        .json({ status: 400, message: "Verification token has expired" });
    }

    // Update the user's verification status
    student.isVerified = true;
    await student.save();

    response
      .status(200)
      .json({ status: 400, message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    return response
      .status(500)
      .json({ status: 500, message: "Internal Server Error", data: { error } });

    // next(error);
  }
};

const resendVerificationEmail = async (request, response, next) => {
  try {
    const { email } = request.body;
    // Find the user by email
    const user = await Student.findOne({ email });

    if (!user) {
      // throw createError.NotFound(`User with email ${email} does not exist`);
      return response.status(404).json({
        status: 404,
        message: `User with email ${email} does not exist`,
      });
    }

    if (user.isVerified) {
      return response
        .status(400)
        .json({ status: 400, message: "Email is already verified." });
    }

    // Generate a new verification token
    const verificationToken = generateVerificationToken(email);
    const verificationTokenExpiry = generateVerificationTokenExpiry();

    // Update the user's document with the new verification token and expiration time
    user.verificationToken = verificationToken;
    user.verificationTokenExpire = verificationTokenExpiry;
    await user.save();

    // Send the verification email with the new token
    await sendVerificationEmail(user, verificationToken, "student");

    response.status(200).json({
      success: true,
      status: 200,
      message: "Verification email resent successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Error resending verification email:", error);
    return response
      .status(500)
      .json({ status: 500, message: "Internal Server Error", data: { error } });
    // next(error);
  }
};

module.exports = {
  registerStudent,
  loginStudent,
  logoutStudent,
  profileStudent,
  verifyEmail,
  resendVerificationEmail,
};
