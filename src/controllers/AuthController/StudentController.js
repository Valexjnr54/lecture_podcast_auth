const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const Student = require("../../models/StudentModel");
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

const registerStudent = async (request, response, next) => {
  try {
    const result = await studentAuthSchema.validateAsync(request.body);
    const doesExist = await Student.findOne({ email: result.email });
    if (doesExist) throw createError.Conflict(`${result.email} already exist`);

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
    await sendVerificationEmail(savedStudent, verificationToken);

    response.status(201).json({ student: savedStudent });
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
};

const loginStudent = async (request, response, next) => {
  try {
    const result = await loginSchema.validateAsync(request.body);
    const student = await Student.findOne({ email: result.email });
    if (!student) throw createError.Unauthorized(`Unauthorized Student`);

    // Check if the email is verified
    if (!student.isVerified) {
      throw createError.Unauthorized(
        `Email not verified. Please check your inbox for the verificat ion email.`
      );
    }

    const isMatch = await student.isValidPassword(result.password);
    if (!isMatch) {
      throw createError.Unauthorized("Invalid Email/Password");
    }
    if (!Config.Jwt_secret) {
      console.error("Jwt_secret is not defined!");
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
    // Generate a JWT token for the logged-in student
    const token = jwt.sign(
      {
        studentId: student._id,
        email: student.email,
        fullname: student.fullname,
      },
      Config.Jwt_secret
    );
    response.status(201).json({ student: student, token });
  } catch (error) {
    if (error.isJoi === true)
      return next(createError.BadRequest("Invalid Email/Password"));
    next(error);
  }
};

const logoutStudent = async (request, response, next) => {
  try {
    if (!request.headers["authorization"])
      next(createError.Unauthorized("Unauthorized Student"));
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
    response.status(500).json({ message: "Internal Server Error" });
  }
};

const profileStudent = async (request, response, next) => {
  try {
    const userId = request.user.studentId;
    const student = await Student.findOne({ _id: userId });
    if (!student) throw createError.NotFound(`Student Not Found`);
    response.status(200).json({ student: student });
  } catch (error) {
    console.log(error);
  }
};

const verifyEmail = async (request, response, next) => {
  try {
    const { token } = request.query;
    const decoded = jwt.verify(token, Config.Jwt_secret);
    const student = await Student.findOne({ email: decoded.email });

    if (!student) {
      throw createError.NotFound("User not found");
    }

    // Update the user's verification status
    student.isVerified = true;
    await student.save();

    response.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStudent,
  loginStudent,
  logoutStudent,
  profileStudent,
  verifyEmail,
};
