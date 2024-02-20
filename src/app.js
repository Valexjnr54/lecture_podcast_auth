const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
const bodyParser = require('body-parser')
const Config = require('./config/config')
require('./helpers/init_redis')
// const rateLimiter = require('rate-limiter-flexible')
const LecturerAuthRouter = require('./routes/Auths/lecturerAuthRoutes')
const LearnerAuthRouter = require('./routes/Auths/studentAuthRoutes')
const AdminAuthRouter = require('./routes/Auths/adminAuthRoutes')
const refreshTokenRouter = require('./routes/refreshTokenRoutes')
require('dotenv').config()
require('./helpers/init_mongoose')

const app = express();
app.use(morgan('dev'))
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

// app.use(rateLimiter);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});


const route = "/api/v1"

app.get('/', (req, res, next) => {
    return res.send('Lecture Podcast Starts')
})
// Authentication Routes Starts
app.use(route+"/auth",LecturerAuthRouter)
app.use(route+"/auth",LearnerAuthRouter)
app.use(route+"/auth",AdminAuthRouter)
app.use(route,refreshTokenRouter)
// app.use(route+"/auth",riderAuthRouter)
// app.use(route+"/auth",adminAuthRouter)

app.use(async (req,res,next) => {
    next(createError.NotFound())
})

app.use((err,req,res,next) => {
    res.status(err.status || 500)
    res.send({
        error:{
            status: err.status || 500,
            message: err.message,
        }
    })
})



module.exports = app;