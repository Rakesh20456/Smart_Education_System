const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
    name : String,
    email : String,
    mcqs : Number,
    programs : [
        {
            programming : String,
            count : Number
        }
    ],
    points : Number
})

const ProfileModel = mongoose.model('learnProfile', ProfileSchema)
module.exports = ProfileModel