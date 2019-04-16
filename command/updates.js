const cloudscraper = require('cloudscraper')
const $ = require('cheerio')
const fs = require('fs')

let CronJob = require('cron').CronJob
let methods = {}
let msg = null
let filepath = './save/latestChapter.json'
let cron = new CronJob('*/15 * * * * *', function() {
    doScraping()
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
    if (!fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, JSON.stringify(latestChapter))
        console.log('latestChapter.json created.')
    } else {
        let savedFile = JSON.parse(fs.readFileSync(filepath, 'utf8'))
        
        if (savedFile.chapter < latestChapter.chapter) {
            fs.writeFileSync(filepath, JSON.stringify(latestChapter))

            msg.channel.send('New chapter of the best manga in the world is out!' + 
                '\nRead here: https://mangadex.org/chapter/' + latestChapter.id + '/1')
            
            console.log('New chapter is out.')
        } else {
            console.log('No new chapter.')
        }
    }
}

module.exports = methods