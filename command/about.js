let path = require('path')
let fs = require('fs')

let aboutPath = path.resolve('save', 'about.sav')
let methods = {}

methods.showAbout = function(msg) {
    if (!fs.existsSync(aboutPath)) {
        fs.writeFileSync(aboutPath, '')
    }

    let aboutInfo = fs.readFileSync(aboutPath, 'utf8')  
    msg.channel.send(aboutInfo)
}

module.exports = methods