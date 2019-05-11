let methods = {}
let path = require('path')
let Sentiment = require('sentiment')

let mikuPoutImg = path.resolve('res', 'mikupout.png')

methods.showReaction = function(msg) {
    let sentiment = new Sentiment()
    let result = sentiment.analyze(msg.content)

    if (result.score > 0) {
        msg.channel.send('Love ya!')
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

module.exports = methods