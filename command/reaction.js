let methods = {}
let path = require('path')
let Sentiment = require('sentiment')

let mikuPoutImg = path.resolve('res', 'mikupout.png')

let lastReactTime

methods.showReaction = function(msg) {
    if (!shouldReact()) {
        return
    }

    let sentiment = new Sentiment()
    let result = sentiment.analyze(msg.content)

    if (result.score > 0) {
        msg.channel.send('(¬‿¬)')
    } else if (result.score < 0) {
        msg.channel.startTyping()
        msg.channel.send({
            files: [{
                attachment: mikuPoutImg,
                name: 'mikupout.png'
            }]
        })
        .then(() => {
            msg.channel.stopTyping()
        })
        .catch(err => {
            msg.channel.stopTyping()
            console.log(err)
        })
    }
}

methods.sayNinoGang = function(msg) {
    if (!shouldReact()) {
        return
    }
    msg.channel.send('Nino Gang!')
}

function shouldReact() {
    if (lastReactTime != null && new Date().getTime() - lastReactTime.getTime() < 20000) {
        return false
    }
    
    lastReactTime = new Date()
    return true
}

module.exports = methods