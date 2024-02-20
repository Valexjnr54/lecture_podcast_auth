const Joi = require('@hapi/joi')

const authSchema = Joi.object({
    fullname: Joi.string().required(),
    email: Joi.string().email().lowercase().required(),
    phone_number: Joi.string().required(),
    area_of_expertise: Joi.string().required(),
    affiliated_institution: Joi.string(),
    password: Joi.string().min(8).required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    confirm_password: Joi.ref('password')
})

const adminAuthSchema = Joi.object({
    fullname: Joi.string().required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    confirm_password: Joi.ref('password')
})

const studentAuthSchema = Joi.object({
    fullname: Joi.string().required(),
    email: Joi.string().email().lowercase().required(),
    phone_number: Joi.string().required(),
    password: Joi.string().min(8).required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    confirm_password: Joi.ref('password')
})

const loginSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).required(),
})

module.exports = { authSchema, loginSchema, adminAuthSchema, studentAuthSchema }