const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage } = require('./utils/messages')
const { addUser, removeUser, getUsersList, findUser } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const public = path.join(__dirname, '../public')

app.use(express.static(public))

// let count = 0
var mssg = ''

//socket.emit :-- sends mssg to a specific client
//io.emit:-- to everyone
//socket.broadcast.emit:-- sends to everyone except d sender
//io.to.emit:-- emits to everyone in a specific room
//socket.broadcast.to.emit:-- sends to everyone except for d sender, also limiting to  a chat room

io.on('connection', (socket) => {
    console.log('New web socket connection')

    socket.on('join', (options, callback) => {
        
            const { error, user } = addUser({ id: socket.id, ...options })
            if(error){
                return callback(error) 
            }
            socket.join(user.room)
            socket.emit('welcome', generateMessage('Hey ' + user.username + ', welcome to ' + user.room + ' room', 'Chatbot'))
            socket.broadcast.to(user.room).emit('welcome', generateMessage(user.username + ' just joined', 'Chatbot'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersList(user.room)
            })
            callback()
    })

    
    socket.on('rmessage', (message, callback) => {
        const user = findUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback( user.username + ' profanity is not allowed')
        }
        io.to(user.room).emit('welcome', generateMessage(message, user.username))
        callback()
    })


    socket.on('sendLocation', (coords, callback)=>{
        const user = findUser(socket.id)
        io.to(user.room).emit('locationMessage', generateMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`, user.username))
        callback()
    })




    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('welcome', generateMessage( `${user.username} has left!`, 'Chatbot'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersList(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`listening on port ${port}`)
})

