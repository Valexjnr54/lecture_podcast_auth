const Config = {
    secret: process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcwNjg3NjE5MywiaWF0IjoxNzA2ODc2MTkzfQ.T4DRYd3sP8BEyoxcJCP8zdA3R2A5MzmABX8HwTsdkmw',
    refresh_secret: process.env.JWT_REFRESH_SECRET || 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcwNjg3NjE5MywiaWF0IjoxNzA2ODc2MTkzfQ.YiSKdNDG--NL-TECYNyaZxeGeIBvDhl0CzFMoFKev9s',
    corsAllowedOrigin: process.env.CORS_ALLOWED_ORIGIN || '*',
};


module.exports = { Config }