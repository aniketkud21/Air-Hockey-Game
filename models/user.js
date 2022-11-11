const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    'username': String,
    'salt': String, 
    'hash': String,
    'games': Number,
    'wins':Number,
    'loss':Number,
    'points':Number
})

module.exports = mongoose.model('User', userSchema)