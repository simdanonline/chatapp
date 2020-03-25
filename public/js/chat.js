const socket = io()

// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated ' + count)
// })

const $messageForm = document.querySelector('#submitform')
const $mssgFormInput = document.querySelector('#textinput')
const $mssgFormButton = $messageForm.querySelector('#submitbtn')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.getElementById('location-template').innerHTML
const $sidebarTemplate = document.getElementById('sidebar-template').innerHTML

const { username, room } =  Qs.parse(location.search, { ignoreQueryPrefix: true })
const autoscroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Get height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //distance scrolled tru
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

    console.log(newMessageHeight)
}

socket.on('welcome', (mssg) => {
    //console.log(mssg)
    const html = Mustache.render($messageTemplate, {
        username: mssg.username,
        message: mssg.text,
        createdAt: moment(mssg.createdAt).format("hh:ma")
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (loc) => {
    console.log(loc)
    const link = Mustache.render($locationTemplate, {
        username: loc.username,
        location: loc.text,
        createdAt: moment(loc.createdAt).format("hh:ma")
    })
    $messages.insertAdjacentHTML('beforeend', link)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
  const html = Mustache.render($sidebarTemplate, {
      room,
      users
  })
  document.getElementById('sidebar').innerHTML = html
})

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked')
//     socket.emit('increment')
// })

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    //$mssgFormButton.setAttribute('disabled', 'disabled')
    // const message = document.querySelector('#textinput').value
    const message = e.target.elements.textinput.value
    socket.emit('rmessage', message, (error)=>{
        
        if(error){
            return console.log(error)
        }
        console.log( `Message delivered`)
    })
    document.getElementById("submitform").reset();
    document.getElementById("submitform").focus()
})
$sendLocationButton.addEventListener('click', (e) => {
    e.preventDefault()
    if(!navigator.geolocation){
        return alert('cant')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (err)=>{
            if(err){
                return console.log(err)
            }
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared')
        })
    })

    

    

    
})

socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})