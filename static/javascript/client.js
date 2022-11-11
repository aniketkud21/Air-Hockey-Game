const socket = io()

const form = document.getElementById('send-container')
const messageInp = document.getElementById('messageInp')
const messageContainer = document.querySelector('.output')
const usersContainer = document.querySelector('.user-list')

socket.emit('new-user-joined',userId)

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
        append(`You : ${message}`)
        messageInp.value = "";
    }
})

socket.on('receive-message', (data)=>{
    append(`${data.name} : ${data.message}`, 'left')
})

let onlinePlayers ={}

socket.on('online-users', (onlineUsers)=>{
    console.log("Hello");
    playersFound ={}
    //console.log(onlineUsers)
    for(var i in onlineUsers){
        if(onlinePlayers[i]==undefined && i!=socket.id){
            console.log(onlineUsers[i].username);
            onlinePlayers[i] = onlineUsers[i].username
            appendUser(onlinePlayers[i])
            playersFound[i] = true
        }
        
    }
    for(var j in onlinePlayers){
        if(!playersFound[j]){
            delete onlinePlayers[j]
            appendUser(onlinePlayers[j])
        }
    }
})