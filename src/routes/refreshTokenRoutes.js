const express = require('express')
const { refreshToken } = require('../controllers/refreshTokenController');
const refreshTokenRouter = express.Router()

refreshTokenRouter.post('/refresh-token', refreshToken);

module.exports = refreshTokenRouter