const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema

const LecturerSchema = new Schema({
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
    phone_number:{
        type: String,
        required: true,
    },
    profile_image:{
        type:String,
        default:null
    },
    area_of_expertise :{
        type: String,
        required: true,
    },
    affiliated_institution:{
        type: String,
    },
    password:{
        type: String,
        required: true
    }
})

LecturerSchema.pre('save', async function(next){
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(this.password, salt)
        this.password = hashedPassword
        next()
    } catch (error) {
        next(error)
    }
})

LecturerSchema.methods.isValidPassword = async function(password) {
    try {
        return await bcrypt.compare(password, this.password)
    } catch (error) {
        throw error
    }
}

const Lecturer = mongoose.model('lecturer',LecturerSchema)

module.exports = Lecturer