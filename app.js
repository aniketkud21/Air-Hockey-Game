const express = require('express')
const router = require("./routes/index")
const passport = require('passport')
const cookieParser = require('cookie-parser')

const app = express()

require('dotenv').config()

const port = process.env.PORT

require("./config/database")

//require("./models/user")

require("./config/passport")(passport)

app.use(passport.initialize())

app.set('view-engine', 'ejs')

const path = require('path')
app.use(express.static(path.join(__dirname, 'static')))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(require("./routes"))
console.log("Passport configured");
app.listen(process.env.PORT, ()=>{
    console.log("Server started");
})
