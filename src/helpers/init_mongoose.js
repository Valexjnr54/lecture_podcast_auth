const mongoose = require('mongoose')

mongoose.connect(process.env.CONNECTION_STRING,{
    dbName: process.env.DB_NAME,
})
.then(() => {
    console.log('MongoDB is Connected')
})
.catch((err) => {
    console.log(err.message)
})

mongoose.connection.on('connected',() => {
    console.log('Mongoose connected to DB')
})

mongoose.connection.on('error',() => {
    console.log(err.message)
})

mongoose.connection.on('disconnected',() => {
    console.log('Mongoose is disconnected from DB')
})

process.on('SIGINT', async () => {
    await mongoose.connection.close()
    process.exit(0)
})