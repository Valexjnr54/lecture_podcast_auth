const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const Student = require("../../models/StudentModel");
const Lecturer = require("../../models/LecturerModel");
const { authSchema, loginSchema } = require("../../helpers/validation_schema");
const {
  signAccessToken,
  signRefreshToken,
  logoutToken,
} = require("../../helpers/jwt_helper");
const { Config } = require("../../config/config");
const { sendVerificationEmail } = require("../../utils/emailSender");
const e = require("cors");

const generateVerificationToken = (email) => {
  return jwt.sign({ email: email }, Config.Jwt_secret, {
    expiresIn: "1d", // Token expires in 1 day
  });
};

const generateVerificationTokenExpiry = () => {
  return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
};

const registerLecturer = async (request, response, next) => {
  try {
    const result = await authSchema.validateAsync(request.body);

    const student = await Student.findOne({ email: result.email });
    if (student) {
      // throw createError.Conflict(
      //   `You cannot register as a lecturer using a student's email.`
      // );
      return response.status(400).json({
        status: 400,
        message: `You cannot register as a lecturer using a student's email.`,
        error: {
          status: 400,
          message: `You cannot register as a lecturer using a student's email.`,
        },
      });
    }

    const doesExist = await Lecturer.findOne({ email: result.email });
    // if (doesExist) throw createError.Conflict(`${result.email} already exist`);
    if (doesExist) {
      return response.status(400).json({
        status: 400,
        message: `${result.email} already exist`,
        error: {
          status: 400,
          message: `${result.email} already exist`,
        },
      });
    }

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
    await sendVerificationEmail(savedLecturer, verificationToken, "lecturer");

    response
      .status(201)
      .json({ data: savedLecturer, success: true, status: 201 });
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    response.status(error.status || 500).json({
      message: error.message,
      success: false,
      status: error.status,
      error,
    });
    // next(error);
  }
};

const loginLecturer = async (request, response, next) => {
  try {
    const result = await loginSchema.validateAsync(request.body);
    const lecturer = await Lecturer.findOne({ email: result.email });

    const student = await Student.findOne({ email: result.email });
    if (student) {
      // throw createError.Unauthorized(
      //   `Unauthorized. We found that you are a student. Please login to the app as a student.`
      // );
      return response.status(400).json({
        status: 400,
        message: `Unauthorized. We found that you are a student. Please login to the app as a student.`,
        error: {
          status: 400,
          message: `Unauthorized. We found that you are a student. Please login to the app as a student.`,
        },
      });
    }

    // if (!lecturer) throw createError.Unauthorized(`Unauthorized lecturer`);
    if (!lecturer) {
      return response.status(400).json({
        status: 400,
        message: `Unauthorized lecturer`,
        error: {
          status: 400,
          message: `Unauthorized lecturer`,
        },
      });
    }

    // Check if the email is verified
    if (!lecturer.isVerified) {
      // throw createError.Unauthorized(
      //   `Email not verified. Please check your inbox for the verification email.`
      // );
      return response.status(400).json({
        status: 400,
        message: `Email not verified. Please check your inbox for the verification email.`,
        error: {
          status: 400,
          message: `Email not verified. Please check your inbox for the verification email.`,
        },
      });
    }

    const isMatch = await lecturer.isValidPassword(result.password);
    if (!isMatch) {
      // throw createError.Unauthorized("Invalid Email/Password");
      return response.status(400).json({
        status: 400,
        message: "Invalid Email/Password",
        error: {
          status: 400,
          message: "Invalid Email/Password",
        },
      });
    }
    if (!Config.Jwt_secret) {
      console.error("Jwt_secret is not defined!");
      res
        .status(500)
        .json({ status: 500, data: {}, message: "Internal Server Error" });
      return;
    }
    // Generate a JWT token for the logged-in lecturer
    const verificationToken = jwt.sign(
      {
        lecturerId: lecturer._id,
        email: lecturer.email,
        fullname: lecturer.fullname,
      },
      Config.Jwt_secret
    );

    lecturer.verificationToken = verificationToken;

    response.status(201).json({ lecturer, token, status: 201, success: true });
  } catch (error) {
    if (error.isJoi === true)
      // return next(createError.BadRequest("Invalid Email/Password"));
      return response.status(400).json({
        status: 400,
        message: `Invalid Email/Password`,
        error: {
          status: 400,
          message: `Invalid Email/Password`,
        },
      });
    // next(error);
  }
};

const logoutLecturer = async (request, response, next) => {
  try {
    if (!request.headers["authorization"])
      // next(createError.Unauthorized("Unauthorized Lecturer"));
      return response.status(400).json({
        status: 400,
        message: `Unauthorized Lecturer`,
        error: {
          status: 400,
          message: `Unauthorized Lecturer`,
        },
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
      .json({ status: 500, data: {}, message: "Internal Server Error", error });
  }
};

const profileLecturer = async (request, response, next) => {
  try {
    const userId = request.user.lecturerId;
    const lecturer = await Lecturer.findOne({ _id: userId });
    // if (!lecturer) throw createError.NotFound(`Lecturer Not Found`);
    if (!lecturer) {
      return response.status(404).json({
        status: 404,
        message: `Lecturer Not Found`,
        error: {
          status: 404,
          message: `Lecturer Not Found`,
        },
      });
    }
    response.status(200).json({
      status: 200,
      message: "Lecturer Profile Fetched Successfully",
      data: lecturer,
    });
  } catch (error) {
    console.log(error);
    response
      .status(500)
      .json({ status: 500, data: {}, message: "Internal Server Error", error });
  }
};

const getAllLecturers = async (request, response, next) => {
  try {
    const lecturers = await Lecturer.find();
    response.status(200).json({
      status: 200,
      message: "Lecturers Fetched Successfully",
      data: lecturers,
    });
  } catch (error) {
    console.error("Error fetching lecturers:", error);
    return response.status(500).json({
      status: 500,
      message: "Internal server error",
      error,
    });
    // next(error);
  }
};

const verifyEmail = async (request, response, next) => {
  try {
    const { token } = request.query;
    let decoded;
    try {
      decoded = jwt.verify(token, Config.Jwt_secret);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return response.status(400).json({
          status: 400,
          message: "Verification token has expired",
          error,
        });
      }
      throw error; // Re-throw other errors
    }
    const lecturer = await Lecturer.findOne({ email: decoded.email });

    if (!lecturer) {
      // throw createError.NotFound("User not found");
      return response.status(404).json({
        status: 404,
        message: "User not found",
        error: {
          status: 404,
          message: "User not found",
        },
      });
    }

    if (lecturer.isVerified) {
      return response.status(400).json({
        status: 400,
        message: "Email is already verified.",
        error: {
          status: 400,
          message: "Email is already verified.",
        },
      });
    }

    // Check if the verification token has expired
    const currentTime = new Date();
    const tokenExpiration = new Date(decoded.exp * 1000); // Convert seconds to milliseconds
    if (currentTime > tokenExpiration) {
      // throw createError.BadRequest("Verification token has expired");
      return response.status(400).json({
        status: 400,
        message: "Verification token has expired",
        error: {
          status: 400,
          message: "Verification token has expired",
        },
      });
    }

    // Update the user's verification status
    lecturer.isVerified = true;
    await lecturer.save();

    response.status(200).json({
      status: 200,
      message: "Email verified successfully",
      data: lecturer,
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    return response.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error,
    });
    // next(error);
  }
};

const resendVerificationEmail = async (request, response, next) => {
  try {
    const { email } = request.body;
    // Find the user by email
    const user = await Lecturer.findOne({ email });

    if (!user) {
      // throw createError.NotFound(`User with email ${email} does not exist`);
      return response.status(404).json({
        status: 404,
        message: `User with email ${email} does not exist`,
        error: {
          status: 404,
          message: `User with email ${email} does not exist`,
        },
      });
    }

    if (user.isVerified) {
      return response.status(400).json({
        status: 400,
        message: "Email is already verified.",
        error: {
          status: 400,
          message: "Email is already verified.",
        },
      });
    }

    // Generate a new verification token
    const verificationToken = generateVerificationToken(email);
    const verificationTokenExpiry = generateVerificationTokenExpiry();

    // Update the user's document with the new verification token and expiration time
    user.verificationToken = verificationToken;
    user.verificationTokenExpire = verificationTokenExpiry;
    await user.save();

    // Send the verification email with the new token
    await sendVerificationEmail(user, verificationToken, "lecturer");

    response.status(200).json({
      success: true,
      status: 200,
      message: "Verification email resent successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Error resending verification email:", error);
    return response.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error,
    });
    // next(error);
  }
};

module.exports = {
  registerLecturer,
  loginLecturer,
  logoutLecturer,
  profileLecturer,
  getAllLecturers,
  verifyEmail,
  resendVerificationEmail,
};
