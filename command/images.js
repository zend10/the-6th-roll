let methods = {}

let plsHug = 'https://i.imgur.com/jIHHJTU.jpg'
let hugMiku = 'https://i.imgur.com/HGiSqu9.jpg'

methods.showPlsHug = function(msg) {
    msg.channel.send(plsHug)
    msg.channel.send('*6t-hugmiku to give Miku a hug.*')
}

methods.showHugMiku = function(msg) {
    msg.channel.send(hugMiku)
}

module.exports = methods