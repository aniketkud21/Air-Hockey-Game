if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const { MongoStore } = require('connect-mongo');
const MongoDBStore = require('connect-mongo');

const express = require('express')
const app = express()

const http = require('http')
const server = http.createServer(app)
const {Server} = require('socket.io')
const io = new Server(server)

//const router = require('./routes/index')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const flash = require('connect-flash')
const cors = require('cors')


const User = require("./models/user")

// Port no
require('dotenv').config()
const port = process.env.PORT

// Database and Passport configuration
require("./config/database")
require("./config/passport")(passport)

app.use(cors())
app.use(passport.initialize())

app.set('view-engine', 'ejs')

const path = require('path')
app.use(express.static(path.join(__dirname, 'static')))

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

const secret = process.env.secret || 'thisshouldbeabettersecret';
const store = MongoDBStore.create({
  mongoUrl: process.env.DB_URL,
  crypto: {
    secret,
  },
   // should be in seconds:
   touchAfter: 24 * 60 * 60,
});
store.on('error', function (e) {
  console.log('Session store error: ', e);
});

// express-session settings
const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() * 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));

// app.use(session({
//     secret: 'keyboard cat',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { maxAge:6000000 }
// }))
app.use(flash())

app.get('/noob', (req,res)=>{
    console.log("noob");
    res.send('noob route')
})
app.use(require('./routes/index'))
console.log("Passport configured");

// Socket ----------------------------

const onlineUsers = {}

io.on('connection', (socket)=>{
    //console.log("Socket connected ", socket.id);

    socket.on('new-user-joined', (userId)=>{
        User.findById(userId)
        .then((user)=>{
            onlineUsers[socket.id] = user
            //console.log(onlineUsers)
            io.emit('online-users', onlineUsers)
        })
        .catch((err)=>{
            console.log(err);
        })
    })

    socket.on('disconnect', ()=>{
        delete onlineUsers[socket.id]
        io.emit('online-users', onlineUsers)
    })

    socket.on('send-message', (message)=>{
        //console.log(message);
        socket.broadcast.emit('receive-message', {message: message, name:onlineUsers[socket.id]})
    })
})

server.listen(process.env.PORT, ()=>{
    console.log("Server started");
})

module.exports=server
