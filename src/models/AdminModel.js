const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema

const AdminSchema = new Schema({
    fullname:{
        type: String,
        required: true,
    },
    email:{
        type:String,
        required: true,
        lowercase: true,
        unique:true,
    },
    password:{
        type: String,
        required: true
    }
})

AdminSchema.pre('save', async function(next){
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(this.password, salt)
        this.password = hashedPassword
        next()
    } catch (error) {
        next(error)
    }
})

AdminSchema.methods.isValidPassword = async function(password) {
    try {
        return await bcrypt.compare(password, this.password)
    } catch (error) {
        throw error
    }
}

const Admin = mongoose.model('admin',AdminSchema)

module.exports = Admin