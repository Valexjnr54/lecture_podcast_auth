const jwt = require('jsonwebtoken');
const createError = require('http-errors')
const Admin = require('../../models/AdminModel')
const { adminAuthSchema, loginSchema } = require('../../helpers/validation_schema')
const { signAccessToken, signRefreshToken, logoutToken } = require('../../helpers/jwt_helper')
const { Config } = require('../../config/config')

const registerAdmin = async (request,response,next) => {
    try {
        const result = await adminAuthSchema.validateAsync(request.body)
        const doesExist = await Admin.findOne({ email: result.email})
        if(doesExist)
            throw createError.Conflict(`${result.email} already exist`)
        const admin = new Admin(result)
        const savedAdmin = await admin.save()
        // const accessToken = await signAccessToken(savedAdmin.id)
        // const refreshToken = await signRefreshToken(savedAdmin.id)
        if (!Config.Jwt_secret) {
            console.error('Jwt_secret is not defined!');
            res.status(500).json({ message: 'Internal Server Error' });
            return;
        }
        // Generate a JWT token for the newly registered Admin
        const token = jwt.sign({ adminId: savedAdmin._id, email: savedAdmin.email, fullname: savedAdmin.fullname }, Config.Jwt_secret);
        response.status(201).json({admin: savedAdmin, token})
    } catch (error) {
        if(error.isJoi === true) error.status = 422
        next(error)
    }
}

const loginAdmin = async (request,response,next) => {
    try {
        const result = await loginSchema.validateAsync(request.body)
        const admin = await Admin.findOne({ email: result.email})
        if(!admin)
            throw createError.Unauthorized(`Unauthorized Admin`)
        const isMatch = await admin.isValidPassword(result.password)
        if(!isMatch) throw createError.Unauthorized('Invalid Email/Password')
        // const accessToken = await signAccessToken(admin.id)
        // const refreshToken = await signRefreshToken(admin.id)
        if (!Config.Jwt_secret) {
            console.error('Jwt_secret is not defined!');
            res.status(500).json({ message: 'Internal Server Error' });
            return;
        }
        // Generate a JWT token for the newly registered Admin
        const token = jwt.sign({ adminId: admin._id, email: admin.email, fullname: admin.fullname }, Config.Jwt_secret);
        response.status(201).json({admin: admin, token: accessToken, refresh_token: refreshToken})
    } catch (error) {
        if(error.isJoi === true) return next(createError.BadRequest('Invalid Email/Password'))
        next(error)
    }
}

const logoutAdmin = async (request,response,next) => {
    try {
        if(!request.headers['authorization']) next(createError.Unauthorized('Unauthorized Admin'))
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

const profileAdmin = async (request, response, next) => {
    try {
        const userId = request.user.adminId
        const admin = await Admin.findOne({ _id: userId})
        if(!admin)
            throw createError.NotFound(`Admin Not Found`)
        response.status(200).json({admin: admin})
    } catch (error) {
        console.log(error)
    }
}


module.exports = { registerAdmin, loginAdmin, profileAdmin, logoutAdmin }