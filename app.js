const express = require('express')
const app = express()

const http = require('http')
const server = http.createServer(app)
const {Server} = require('socket.io')
const io = new Server(server)

const router = require("./routes/index")
const passport = require('passport')
const cookieParser = require('cookie-parser')

const User = require("./models/user")

require('dotenv').config()

const port = process.env.PORT

require("./config/database")

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

// Socket ----------------------------

const onlineUsers = {}

io.on('connection', (socket)=>{
    console.log("Socket connected ", socket.id);
    console.log(onlineUsers.length);

    socket.on('new-user-joined', (userId)=>{
        User.findById(userId)
        .then((user)=>{
            onlineUsers[socket.id] = user
            console.log(onlineUsers)
        })
        .catch((err)=>{
            console.log(err);
        })
        //todo
        io.emit('online-users', onlineUsers)
    })

    socket.on('send-message', (message)=>{
        console.log(message);
        socket.broadcast.emit('receive-message', {message: message, name:onlineUsers.get(socket.id).username})
    })
})


server.listen(process.env.PORT, ()=>{
    console.log("Server started");
})
