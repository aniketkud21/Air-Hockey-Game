const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    'username': String,
    'salt': String, 
    'hash': String,
})

module.exports = mongoose.model('User', userSchema)