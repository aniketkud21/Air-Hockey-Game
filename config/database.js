const mongoose = require('mongoose')

require('dotenv').config()

const url = process.env.DB_URL

mongoose.connect(url, {
    useNewUrlParser:true,
    useUnifiedTopology:true
})

const con = mongoose.connection

con.on('open', ()=>{
    console.log("Database connected");
})