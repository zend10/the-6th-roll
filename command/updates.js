require('dotenv').config()

const cloudscraper = require('cloudscraper')
const $ = require('cheerio')
const fs = require('fs')
const fetch = require('node-fetch')
let path = require('path')

let CronJob = require('cron').CronJob
let methods = {}
let botClient = null

let cron = new CronJob('*/20 * * * *', doScraping, null, false, 'UTC')

let latestChapterPath = path.resolve('save', 'latestChapter.json')
let latestMangaNewsPath = path.resolve('save', 'latestMangaNews.json')
let latestAnimeNewsPath = path.resolve('save', 'latestAnimeNews.json')
let subscribedChannelsPath = path.resolve('save', 'subscribedChannels.sav')

// let mangadexApiUrl = 'https://mangadex.org/api/manga/20679'
let annMangaUrl = 'https://www.animenewsnetwork.com/encyclopedia/manga.php?id=21269'
let annAnimeUrl = 'https://www.animenewsnetwork.com/encyclopedia/anime.php?id=21514'

methods.registerChannel = function(client, msg) {
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
            msg.channel.send(':)')
        }
    } else {
        // if first time ever
        fs.writeFileSync(subscribedChannelsPath, msg.channel.id)
        msg.channel.send('Got it!')
        cron.start()
    }
}

methods.unregisterChannel = function(client, msg) {
    botClient = client

    if (fs.existsSync(subscribedChannelsPath)) {
        let savedChannels = fs.readFileSync(subscribedChannelsPath, 'utf8').split('\n')

        if (savedChannels.includes(msg.channel.id)) {
            savedChannels.splice(savedChannels.indexOf(msg.channel.id), 1)
            fs.writeFileSync(subscribedChannelsPath, savedChannels.join('\n'))
            msg.channel.send('It\'s been a good run!')
            return
        }
    }

    msg.channel.send('Hmm.. What?')
}

methods.rerunCron = function(client, msg) {
    botClient = client
    msg.channel.send('I\'m up and running!')
    cron.start()
}

function doScraping() {
    /*
    fetch(mangadexApiUrl, {
            method: 'POST',
            headers: { 'Cookie': process.env.COOKIE, 'User-Agent': process.env.USER_AGENT }
        })
        .then(res => res.json())
        .then(json => handleMangaChapterJson(json))
        .catch(error => console.log(error))
    */

   let mangaChapterOptions = {
        method: 'GET',
        url: 'https://mangadex.org/title/20679/5toubun-no-hanayome'
    }

    cloudscraper(mangaChapterOptions)
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

            handleMangaChapterResult(latestChapter)
        })
        .catch(function(err) {
            console.log(err.message)
        })

    let mangaNewsOptions = {
        method: 'GET',
        url: annMangaUrl
    }

    cloudscraper(mangaNewsOptions)
        .then(function(html) {
            $('.tab.S0.show', html).each(function(i, elem) {
                if (i == 0) {
                    let thisHtml = $(this).html()
                    let latestNews = {}
                    latestNews['link'] = thisHtml.substring(thisHtml.indexOf('"') + 1, thisHtml.indexOf('">'))
                    latestNews['title'] = $(this).text().trim()

                    handleMangaNewsResult(latestNews)
                }
            })
        })
        .catch(function(err) {
            console.log(err.message)
        })

    let animeNewsOptions = {
        method: 'GET',
        url: annAnimeUrl
    }

    cloudscraper(animeNewsOptions)
        .then(function(html) {
            let prevTime = new Date().getTime()
            let isStop = false

            $('.tab.S0.show', html).each(function(i, elem) {
                let thisHtml = $(this).html()
                let thisTime = new Date(thisHtml.substring(thisHtml.indexOf(">(") + 2, thisHtml.indexOf(")<"))).getTime()

                if (thisTime > prevTime && !isStop) {
                    let latestNews = {}
                    latestNews['link'] = thisHtml.substring(thisHtml.indexOf('"') + 1, thisHtml.indexOf('">'))
                    latestNews['title'] = $(this).text().trim()

                    handleAnimeNewsResult(latestNews)
                    isStop = true
                }

                prevTime = thisTime
            })
        })
        .catch(function(err) {
            console.log(err.message)
        })
}

/*
function handleMangaChapterJson(json) {
    let chapters = json.chapter
    let latestChapter = { 'chapter': 0 }

    for (var key in chapters) {
        if (chapters.hasOwnProperty(key) && chapters[key].lang_code == 'gb') {
            if (parseInt(chapters[key].chapter) > parseInt(latestChapter.chapter)) {
                latestChapter = chapters[key]
                latestChapter['id'] = key
            }
        }
    }

    handleMangaChapterResult(latestChapter)
}
*/

function handleMangaChapterResult(latestChapter) {
    if (fs.existsSync(latestChapterPath)) {
        let savedChapter = JSON.parse(fs.readFileSync(latestChapterPath, 'utf8'))
        
        if (parseInt(savedChapter.chapter) < parseInt(latestChapter.chapter)) {
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

            console.log(latestChapter)
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

function handleMangaNewsResult(latestNews) {
    if (fs.existsSync(latestMangaNewsPath)) {
        let savedNews = JSON.parse(fs.readFileSync(latestMangaNewsPath, 'utf8'))

        if (savedNews.link != latestNews.link) {
            fs.writeFileSync(latestMangaNewsPath, JSON.stringify(latestNews))

            let subscribedChannels = fs.readFileSync(subscribedChannelsPath, 'utf8').split('\n')
            subscribedChannels.forEach(function(channelID) {
                try {
                    let subscribedChannel = botClient.channels.get(channelID)
                    subscribedChannel.send('A wild news of the best manga in the world appears!\n' + 
                        'Read here: https://www.animenewsnetwork.com' + latestNews.link)
                } catch (ex) {
                    console.log(ex.message)
                }
            })

            console.log(latestNews)
            console.log('Breaking! ' + latestNews.title)
        } else {
            console.log('Same old news:  ' + savedNews.title)
        }
    } else {
        // if first time ever
        fs.writeFileSync(latestMangaNewsPath, JSON.stringify(latestNews))
        console.log('latestMangaNews.json created')
    }
}

function handleAnimeNewsResult(latestNews) {
    if (fs.existsSync(latestAnimeNewsPath)) {
        let savedNews = JSON.parse(fs.readFileSync(latestAnimeNewsPath, 'utf8'))

        if (savedNews.link != latestNews.link) {
            fs.writeFileSync(latestAnimeNewsPath, JSON.stringify(latestNews))

            let subscribedChannels = fs.readFileSync(subscribedChannelsPath, 'utf8').split('\n')
            subscribedChannels.forEach(function(channelID) {
                try {
                    let subscribedChannel = botClient.channels.get(channelID)
                    subscribedChannel.send('A wild anime news of the best manga in the world appears!\n' + 
                        'Read here: https://www.animenewsnetwork.com' + latestNews.link)
                } catch (ex) {
                    console.log(ex.message)
                }
            })

            console.log(latestNews)
            console.log('Breaking, anime news here! ' + latestNews.title)
        } else {
            console.log('Same old anime news:  ' + savedNews.title)
        }
    } else {
        // if first time ever
        fs.writeFileSync(latestAnimeNewsPath, JSON.stringify(latestNews))
        console.log('latestAnimeNews.json created')
    }
}

module.exports = methods