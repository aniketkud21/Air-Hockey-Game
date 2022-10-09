const socket = io()

const form = document.getElementById('send-container')
const messageInp = document.getElementById('messageInp')
const messageContainer = document.querySelector('.container')
const usersContainer = document.querySelector('.userlist')

socket.emit('new-user-joined',userId)

socket.on('online-users', (onlineUsers)=>{

    // todo
    console.log(onlineUsers)
    for(var i in onlineUsers){
        console.log(onlineUsers[i].username);
    }
})

const appendUser = (username)=>{
    const userElement = document.createElement('div')
    userElement.innerText=username
    userElement.classList.add('onlineuser')
    usersContainer.append(userElement)
}

const append = (message, position)=>{
    const messageElement = document.createElement('div')
    messageElement.innerText=message
    messageElement.classList.add('message')
    messageElement.classList.add(position)
    messageContainer.append(messageElement)
}

form.addEventListener('submit', (e)=>{
    e.preventDefault()
    if(messageInp.value){
        const message = messageInp.value
        socket.emit('send-message', message)
        append(`You : ${message}`, 'right')
        messageInp.value = "";
    }
    
})

socket.on('receive-message', (data)=>{
    append(`${data.name} : ${data.message}`, 'left')
})