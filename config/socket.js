const User = require('../models/user')
const {Chat} = require('../controllers/userController')
const chat = new Chat()

const onlineUsers = {}

module.exports = (io)=>{
    io.on('connection', (socket)=>{
        console.log("Socket connected ", socket.id);
    
        socket.on('new-user-joined', (userId)=>{
            User.findById(userId)
            .then((user)=>{
                onlineUsers[socket.id] = user
                console.log(onlineUsers)
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
            chat.sendMessage(socket,message, onlineUsers)
            // console.log(message);
            // socket.broadcast.emit('receive-message', {message: message, name:onlineUsers[socket.id].username})
        })
    })
}

