const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const Lecturer = require("../../models/LecturerModel");
const { authSchema, loginSchema } = require("../../helpers/validation_schema");
const {
  signAccessToken,
  signRefreshToken,
  logoutToken,
} = require("../../helpers/jwt_helper");
const { Config } = require("../../config/config");

const registerLecturer = async (request, response, next) => {
  try {
    const result = await authSchema.validateAsync(request.body);
    const doesExist = await Lecturer.findOne({ email: result.email });
    if (doesExist) throw createError.Conflict(`${result.email} already exist`);

    const verificationToken = jwt.sign(
      { email: result.email },
      Config.Jwt_secret,
      {
        expiresIn: "1d", // Token expires in 1 day
      }
    );

    // Save the verification token with the user data
    const lecturer = new Lecturer({
      ...result,
      verificationToken,
    });

    const savedLecturer = await lecturer.save();

    // Send verification email
    await sendVerificationEmail(savedLecturer, verificationToken);

    response.status(201).json({ lecturer: savedLecturer });
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
};

const loginLecturer = async (request, response, next) => {
  try {
    const result = await loginSchema.validateAsync(request.body);
    const lecturer = await Lecturer.findOne({ email: result.email });
    if (!lecturer) throw createError.Unauthorized(`Unauthorized lecturer`);

    // Check if the email is verified
    if (!lecturer.isVerified) {
      throw createError.Unauthorized(
        `Email not verified. Please check your inbox for the verification email.`
      );
    }

    const isMatch = await lecturer.isValidPassword(result.password);
    if (!isMatch) {
      throw createError.Unauthorized("Invalid Email/Password");
    }
    if (!Config.Jwt_secret) {
      console.error("Jwt_secret is not defined!");
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
    // Generate a JWT token for the logged-in lecturer
    const token = jwt.sign(
      {
        lecturerId: lecturer._id,
        email: lecturer.email,
        fullname: lecturer.fullname,
      },
      Config.Jwt_secret
    );
    response.status(201).json({ lecturer: lecturer, token });
  } catch (error) {
    if (error.isJoi === true)
      return next(createError.BadRequest("Invalid Email/Password"));
    next(error);
  }
};

const logoutLecturer = async (request, response, next) => {
  try {
    if (!request.headers["authorization"])
      next(createError.Unauthorized("Unauthorized Lecturer"));
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

const profileLecturer = async (request, response, next) => {
  try {
    const userId = request.user.lecturerId;
    const lecturer = await Lecturer.findOne({ _id: userId });
    if (!lecturer) throw createError.NotFound(`Lecturer Not Found`);
    response.status(200).json({ lecturer: lecturer });
  } catch (error) {
    console.log(error);
  }
};

const getAllLecturers = async (request, response, next) => {
  try {
    const lecturers = await Lecturer.find();
    response.status(200).json({ lecturers });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerLecturer,
  loginLecturer,
  logoutLecturer,
  profileLecturer,
  getAllLecturers,
};
