const jwt = require('jsonwebtoken')
const createError = require('http-errors')
const { Config } = require('../config/config')

// Sample blacklist to store invalidated tokens
const blacklist = new Set();

module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload= {}
            const secret = Config.secret
            const option = {
                expiresIn: "2h",
                issuer: "lecturepodcast.com",
                audience: userId,
            }
            jwt.sign(payload, secret, option, (error, token) => {
                if(error) {
                    console.log(error.message)
                    return reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },
    verifyAccessToken: (request, response, next) => {
        if(!request.headers['authorization']) next(createError.Unauthorized('Unauthorized Lecturer'))
        const authHeader = request.headers['authorization']
        const bearerToken = authHeader.split(' ')
        const token = bearerToken[1]

        // Check if token is blacklisted
        if (blacklist.has(token)) {
            return next(createError.Unauthorized('Token revoked'));
        }

        jwt.verify(token, Config.secret, (error, payload) => {
            if (error) {
                if (error.name === 'JsonWebTokenError') {
                    return next(createError.Unauthorized('Unauthorized Lecturer'))
                } else {
                    return next(createError.Unauthorized('Session Expired'))
                }
            }
            request.payload = payload
            next()
        })
    },
    signRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload= {}
            const secret = Config.refresh_secret
            const option = {
                expiresIn: "1y",
                issuer: "lecturepodcast.com",
                audience: userId,
            }
            jwt.sign(payload, secret, option, (error, token) => {
                if(error) {
                    console.log(error.message)
                    return reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve,reject) => {
            jwt.verify(refreshToken, Config.refresh_secret, (error,payload) => {
                if(error) return reject(createError.Unauthorized())
                const userId = payload.aud

                resolve(userId)
            })
        })
    },
    logoutToken: (token) => {
        blacklist.add(token);
    }
}