const mongoose = require('mongoose')

const gameSchema = new mongoose.Schema({
    'p1': {
        user_id: mongoose.Types.ObjectId,
        points: Number
    },
    'p2': {
        user_id: mongoose.Types.ObjectId,
        points: Number
    },
})

module.exports = mongoose.model('gameSchema',gameSchema)