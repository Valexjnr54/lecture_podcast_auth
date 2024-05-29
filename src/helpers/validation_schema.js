const Joi = require("@hapi/joi");

const authSchema = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().email().lowercase().required(),
  phone_number: Joi.string().required(),
  area_of_expertise: Joi.string().required(),
  affiliated_institution: Joi.string(),
  account_summary: Joi.string(),
  password: Joi.string()
    .min(8)
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
      )
    )
    .message(
      "Password must contain at least one alphabetical character, one digit, one special symbol, and be at least 8 characters long"
    ),
  confirm_password: Joi.ref("password"),
});

const adminAuthSchema = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string()
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
      )
    )
    .message(
      "Password must contain at least one alphabetical character, one digit, one special symbol, and be at least 8 characters long"
    ),
  confirm_password: Joi.ref("password"),
});

const studentAuthSchema = Joi.object({
  fullname: Joi.string().required(),
  address: Joi.string().required(),
  email: Joi.string().email().lowercase().required(),
  phone_number: Joi.string().required(),
  password: Joi.string()
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
      )
    )
    .message(
      "Password must contain at least one alphabetical character, one digit, one special symbol, and be at least 8 characters long"
    ),
  confirm_password: Joi.ref("password"),
  university: Joi.string().required(),
  course: Joi.string().required(),
  level: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),
});

module.exports = {
  authSchema,
  loginSchema,
  adminAuthSchema,
  studentAuthSchema,
};
