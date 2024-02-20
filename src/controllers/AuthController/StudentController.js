const express = require('express')
const createError = require('http-errors')
const Student = require('../../models/StudentModel')
const { studentAuthSchema, loginSchema } = require('../../helpers/validation_schema')
const { signAccessToken, signRefreshToken, logoutToken } = require('../../helpers/jwt_helper')

const registerStudent = async (request,response,next) => {
    try {
        const result = await studentAuthSchema.validateAsync(request.body)
        const doesExist = await Student.findOne({ email: result.email})
        if(doesExist)
            throw createError.Conflict(`${result.email} already exist`)
        const student = new Student(result)
        const savedStudent = await student.save()
        const accessToken = await signAccessToken(savedStudent.id)
        const refreshToken = await signRefreshToken(savedStudent.id)
        response.status(201).json({student: savedStudent, token: accessToken, refresh_token: refreshToken})
    } catch (error) {
        if(error.isJoi === true) error.status = 422
        next(error)
    }
}

const loginStudent = async (request,response,next) => {
    try {
        const result = await loginSchema.validateAsync(request.body)
        const student = await Student.findOne({ email: result.email})
        if(!student)
            throw createError.Unauthorized(`Unauthorized Student`)
        const isMatch = await student.isValidPassword(result.password)
        if(!isMatch) throw createError.Unauthorized('Invalid Email/Password')
        const accessToken = await signAccessToken(student.id)
        const refreshToken = await signRefreshToken(student.id)
        response.status(201).json({student: student, token: accessToken, refresh_token: refreshToken})
    } catch (error) {
        if(error.isJoi === true) return next(createError.BadRequest('Invalid Email/Password'))
        next(error)
    }
}

const logoutStudent = async (request,response,next) => {
    try {
        if(!request.headers['authorization']) next(createError.Unauthorized('Unauthorized Student'))
        const authHeader = request.headers['authorization']
        const bearerToken = authHeader.split(' ')
        const token = bearerToken[1]
        if (!token) return response.status(400).send('Token not provided');

        // Add token to blacklist
        logoutToken(token);

        response.send('Logged out successfully');
      } catch (error) {
        // Handle any potential errors that may occur during the logout process.
        console.error('Error during logout:', error);
        response.status(500).json({ message: 'Internal Server Error' });
      }
}

const profileStudent = async (request, response, next) => {
    try {
        const userId = request.payload.aud
        const student = await Student.findOne({ _id: userId})
        if(!student)
            throw createError.NotFound(`Student Not Found`)
        response.status(200).json({student: student})
    } catch (error) {
        console.log(error)
    }
}


module.exports = { registerStudent, loginStudent,logoutStudent, profileStudent }