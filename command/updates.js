require('dotenv').config()

let cloudscraper = require('cloudscraper')
let $ = require('cheerio')

let CronJob = require('cron').CronJob
let methods = {}
let botClient = null
let firebase = null

let cron = new CronJob('*/15 * * * * *', doScraping, null, false, 'UTC')

const MANGADEX_URL = 'https://mangadex.org/title/20679/5toubun-no-hanayome'
const ANNMANGA_URL = 'https://www.animenewsnetwork.com/encyclopedia/manga.php?id=21269'
const ANNANIME_URL = 'https://www.animenewsnetwork.com/encyclopedia/anime.php?id=21514'

const DB_SERVER = 'server/'
const DB_MANGA = 'manga/'
const DB_MANGANEWS = 'manganews/'
const DB_ANIMENEWS = 'animenews/'

methods.registerChannel = function(client, msg, fb) {
    botClient = client
    firebase = fb

    firebase.database().ref(DB_SERVER + msg.guild.id).once('value').then(function(snapshot) {
        if (!snapshot.val()) {
            firebase.database().ref(DB_SERVER + msg.guild.id).set({
                server_name: msg.guild.name,
                channel_id: msg.channel.id,
                channel_name: msg.channel.name
            })
            msg.channel.send('Got it!')
        } else {
            msg.channel.send(':)')
        }
    })

    cron.start()
}

methods.unregisterChannel = function(client, msg, fb) {
    botClient = client
    firebase = fb

    firebase.database().ref(DB_SERVER + msg.guild.id).remove().then(function() {
        msg.channel.send('It\'s been a good run! I\'ll miss you!')
    })
}

methods.rerunCron = function(client, msg, fb) {
    botClient = client
    firebase = fb

    msg.channel.send('I\'m up and running!')
    cron.start()
}

function doScraping() {
   let mangaChapterOptions = {
        method: 'GET',
        //headers: { 'Cookie': process.env.COOKIE, 'User-Agent': process.env.USER_AGENT },
        url: MANGADEX_URL
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
            sendLog(err)
        })
    
    let mangaNewsOptions = {
        method: 'GET',
        url: ANNMANGA_URL
    }

    cloudscraper(mangaNewsOptions)
        .then(function(html) {
            let items = []

            $('.tab.S0.show', html).each(function(i, elem) {
                let thisHtml = $(this).html()
                let latestNews = {}
                latestNews['link'] = thisHtml.substring(thisHtml.indexOf('"') + 1, thisHtml.indexOf('">'))
                latestNews['title'] = $(this).text().trim()
                latestNews['id'] = latestNews['link'].substring(latestNews['link'].indexOf('.') + 1)
                
                items[i] = latestNews
            })

            handleMangaNewsResult(items)
        })
        .catch(function(err) {
            sendLog(err)
        })

    let animeNewsOptions = {
        method: 'GET',
        url: ANNANIME_URL
    }

    cloudscraper(animeNewsOptions)
        .then(function(html) {
            let items = []

            $('.tab.S0.show', html).each(function(i, elem) {
                let thisHtml = $(this).html()
                let latestNews = {}
                latestNews['link'] = thisHtml.substring(thisHtml.indexOf('"') + 1, thisHtml.indexOf('">'))
                latestNews['title'] = $(this).text().trim()
                latestNews['id'] = latestNews['link'].substring(latestNews['link'].indexOf('.') + 1)

                items[i] = latestNews
            })

            handleAnimeNewsResult(items)
        })
        .catch(function(err) {
            sendLog(err)
        })  
}

function handleMangaChapterResult(latestChapter) {
    firebase.database().ref(DB_MANGA + latestChapter.chapter).once('value').then(function(snapshot) {
        if (!snapshot.val()) {
            firebase.database().ref(DB_MANGA + latestChapter.chapter).set({
                title: latestChapter.title,
                chapter: latestChapter.chapter,
                volume: latestChapter.volume,
                lang: latestChapter.lang,
                group: latestChapter.group,
                uploader: latestChapter.uploader,
                timestamp: latestChapter.timestamp,
                mangaId: latestChapter.mangaId,
                id: latestChapter.id
            })
            sendLog('New chapter: Chapter ' + latestChapter.chapter)
            
            firebase.database().ref(DB_SERVER).once('value').then(function(snapshot) {
                let result = snapshot.val()
                for (key in result) {
                    try {
                        let subscribedChannel = botClient.channels.get(result[key].channel_id)
                        subscribedChannel.send('New chapter of the best manga in the world is out!' + 
                            '\nRead Chapter ' + latestChapter.chapter +' here: ' + 
                            'https://mangadex.org/chapter/' + latestChapter.id + '/1')
                    } catch (ex) {
                        sendLog(ex)
                    }
                }
            }).catch(function(err) {
                sendLog(err)
            })
        } else {
            sendLog('Still chapter ' + latestChapter.chapter)
        }
    }).catch(function(err) {
        sendLog(err)
    })
}

function handleMangaNewsResult(latestNews) {
    latestNews.forEach(function(item) {
        firebase.database().ref(DB_MANGANEWS + item.id).once('value').then(function(snapshot) {
            if (!snapshot.val()) {
                firebase.database().ref(DB_MANGANEWS + item.id).set({
                    link: item.link,
                    title: item.title
                })
                sendLog('New manga news: ' + item.title)

                firebase.database().ref(DB_SERVER).once('value').then(function(snapshot) {
                    let result = snapshot.val()
                    for (key in result) {
                        try {
                            let subscribedChannel = botClient.channels.get(result[key].channel_id)
                            subscribedChannel.send('A wild news of the best manga in the world is out!' + 
                                '\nRead here: https://www.animenewsnetwork.com' + item.link)
                        } catch (ex) {
                            sendLog(ex)
                        }
                    }
                }).catch(function(err) {
                    sendLog(err)
                })
            } else {
                sendLog('Same old news')
            }
        }).catch(function(err) {
            sendLog(err)
        })
    })
}

function handleAnimeNewsResult(latestNews) {
    latestNews.forEach(function(item) {
        firebase.database().ref(DB_ANIMENEWS + item.id).once('value').then(function(snapshot) {
            if (!snapshot.val()) {
                firebase.database().ref(DB_ANIMENEWS + item.id).set({
                    link: item.link,
                    title: item.title
                })
                sendLog('New anime news: ' + item.title)

                firebase.database().ref(DB_SERVER).once('value').then(function(snapshot) {
                    let result = snapshot.val()
                    for (key in result) {
                        try {
                            let subscribedChannel = botClient.channels.get(result[key].channel_id)
                            subscribedChannel.send('A wild anime news of the best manga in the world is out!' + 
                                '\nRead here: https://www.animenewsnetwork.com' + item.link)
                        } catch (ex) {
                            sendLog(ex)
                        }
                    }
                }).catch(function(err) {
                    sendLog(err)
                })
            } else {
                sendLog('Same old anime news')
            }
        }).catch(function(err) {
            sendLog(err)
        })
    })
}

function sendLog(content) {
    console.log(content)
    botClient.channels.get(process.env.LOG_CHANNEL).send(content)
}

module.exports = methods