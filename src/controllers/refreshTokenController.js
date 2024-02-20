const express = require('express');
const createError = require('http-errors');
const {  signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwt_helper');

const refreshToken = async (request, response, next) => {
    try {
        const { refresh_token } = request.body;
        // console.log(refresh_token)

        // Validation: Check if refreshToken is present
        if (!refresh_token) {
            return next(createError.BadRequest('Refresh token is missing'));
        }

        const userId = await verifyRefreshToken(refresh_token);
        const accessToken = await signAccessToken(userId);
        const refToken = await signRefreshToken(userId);

        const statusCode = 201;
        response.status(statusCode).json({ token: accessToken, refreshToken: refToken });
    } catch (error) {
        // if (error.isJoi === true) return next(createError.BadRequest('Invalid Email/Password'));
        next(error);
    }
};

module.exports = { refreshToken };
