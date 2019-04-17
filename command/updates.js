const cloudscraper = require('cloudscraper')
const $ = require('cheerio')
const fs = require('fs')

let CronJob = require('cron').CronJob
let methods = {}
let botClient = null

let cron = new CronJob('*/15 * * * * *', function() {
    doScraping()
}, null, false, 'UTC')

let latestChapterPath = './save/latestChapter.json'
let subscribedChannelsPath = './save/subscribedChannels.sav'

methods.manageCron = function(client, msg) {
    botClient = client

    if (fs.existsSync(subscribedChannelsPath)) {
        let savedChannels = fs.readFileSync(subscribedChannelsPath, 'utf8').split('\n')

        if (!savedChannels.includes(msg.channel.id)) {
            // if new channel
            savedChannels.push(msg.channel.id)
            fs.writeFileSync(subscribedChannelsPath, savedChannels.join('\n'))
            msg.channel.send('Got it!')
        } else {
            // if existing channel
            savedChannels.splice(savedChannels.indexOf(msg.channel.id), 1)
            fs.writeFileSync(subscribedChannelsPath, savedChannels.join('\n'))
            msg.channel.send('It\'s been a good run!')
        }
    } else {
        // if first time ever
        fs.writeFileSync(subscribedChannelsPath, msg.channel.id)
        msg.channel.send('Got it!')
        cron.start()
    }
}

methods.rerunCron = function(client, msg) {
    botClient = client
    msg.channel.send('I\'m up and running!')
    cron.start()
}

function doScraping() {
    let options = {
        method: 'GET',
        url: 'https://mangadex.org/title/20679/5toubun-no-hanayome'
    }

    cloudscraper(options)
        .then(function(html) {
            let items = []

            $('div[data-lang=1]', html).each(function(i, elem) {
                items[i] = $(this).data()
            })

            let latestChapter = 0
            items.forEach(function(item) {
                if (item.chapter > latestChapter) {
                    latestChapter = item
                }
            })

            handleScrapingResult(latestChapter)
        })
        .catch(function(err) {
            console.log(err)
        })
}

function handleScrapingResult(latestChapter) {
    if (fs.existsSync(latestChapterPath)) {
        let savedChapter = JSON.parse(fs.readFileSync(latestChapterPath, 'utf8'))
        
        if (savedChapter.chapter < latestChapter.chapter) {
            fs.writeFileSync(latestChapterPath, JSON.stringify(latestChapter))

            let subscribedChannels = fs.readFileSync(subscribedChannelsPath, 'utf8').split('\n')
            subscribedChannels.forEach(function(channelID) {
                try {
                    let subscribedChannel = botClient.channels.get(channelID)
                    subscribedChannel.send('New chapter of the best manga in the world is out!' + 
                        '\nRead Chapter ' + latestChapter.chapter +' here: ' + 
                        'https://mangadex.org/chapter/' + latestChapter.id + '/1')
                } catch (ex) {
                    console.log(ex.message)
                }
            })

            console.log('Chapter ' + latestChapter.chapter + ' is out')
        } else {
            console.log('Still chapter ' + savedChapter.chapter)
        }
    } else {
        // if first time ever
        fs.writeFileSync(latestChapterPath, JSON.stringify(latestChapter))
        console.log('latestChapter.json created')
    }
}

module.exports = methods