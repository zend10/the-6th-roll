let CronJob = require('cron').CronJob
let methods = {}

var msg = null

let cron = new CronJob('*/5 * * * * *', function() {
    msg.channel.send(new Date().toString())
}, null, false, 'UTC')

methods.manageUpdateCron = function(message) {
    msg = message
    if (cron.running) {
        msg.channel.send('It\'s been a good run!')
        cron.stop()
    } else {
        msg.channel.send('Got it!')
        cron.start()
    }
}

module.exports = methods