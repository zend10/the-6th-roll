let path = require('path')
let fs = require('fs')
let discord = require('discord.js')

let linkPath = path.resolve('save', 'link.sav')
let methods = {}

methods.showLink = function(msg) {
    if (!fs.existsSync(linkPath)) {
        fs.writeFileSync(linkPath, '')
    }

    let linkInfo = fs.readFileSync(linkPath, 'utf8')
    let embed = new discord.RichEmbed()

    let link = embed
        .setDescription(linkInfo)
        .setImage('https://i.imgur.com/jcJFitI.png')
        
    msg.channel.send(link)
}

module.exports = methods