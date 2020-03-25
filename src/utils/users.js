const users = []

const addUser = ({ id, username, room }) => {
    //clean d data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate d data
    if(!username || !room){
        return {
            error: "Username and room are required"
        }
    }

    //check for existing users

    const existing = users.find(user => {
        return user.room === room && user.username === username
    })

    //validate name
    if(existing){
        return {
            error: "Username is already in use"
        }
    }

    //store d user
    const user = {id, username, room}
    users.push(user)
    return{user}
}


const removeUser = (id) => {
    const index = users.findIndex(user =>  user.id === id)
    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}


const findUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersList = (room) => {
    room = room.toLowerCase().trim()
    const userlist = users.filter(user => user.room === room)
    return userlist
}



//console.log(users)

module.exports = {
    addUser,
    removeUser,
    getUsersList,
    findUser
}