require('dotenv').config()

let path = require('path')
let firebase = require('firebase/app')
require('firebase/database')

let firebaseConfig = {
    apiKey: process.env.FIREBASE_APIKEY,
    authDomain: process.env.FIREBASE_AUTHDOMAIN,
    databaseURL: process.env.FIREBASE_DBURL,
    projectId: process.env.FIREBASE_PROJECTID,
    storageBucket: process.env.FIREBASE_STORAGEBUCKET,
    messagingSenderId: process.env.FIREBASE_SENDERID
}

let discord = require('discord.js')
let updates = requireFile('updates.js')
let reaction = requireFile('reaction.js')
let anime = requireFile('anime.js')
let manga = requireFile('manga.js')
let link = requireFile('link.js')
let images = requireFile('images.js')
let about = requireFile('about.js')

let client = new discord.Client()

const PREFIX = '6t-'

const cmd = {
    START: 'start',
    STOP: 'stop',
    RERUN: 'rerun',
    ANIME: 'anime',
    MANGA: 'manga',
    LINK: 'link',
    MIKUSAY: 'mikusay',
    CLAIMHUG: 'claimhug',
    ABOUT: 'about'
}

const alias = ['gotoubun', '5toubun', '5-toubun', 'go-toubun', 
    'quintessential', 'quintuplets', 'quint', 'quints', 
    '五等分の花嫁', 'cinnamon']

firebase.initializeApp(firebaseConfig)

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
    client.user.setPresence({
        game: {
            name: '6t-about',
            type: 'LISTENING'
        }
    })
})

client.on('message', msg => {
    if (msg.content.startsWith(PREFIX)) {
        checkCommand(client, msg)
    }

    // if (msg.author.id != process.env.BOT_ID) {
    //     if (msg.content.toLowerCase().includes('nino')) {
    //         reaction.sayNinoGang(msg)
    //     }

    //     alias.forEach(function(item) {
    //         if (msg.content.toLowerCase().includes(item)) {
    //             reaction.showReaction(msg)
    //         }
    //     })
    // }
})

function requireFile(filename) {
    return require(path.resolve('command', filename))
}

function checkCommand(client, msg) {
    switch (msg.content.substring(PREFIX.length)) {
        case cmd.START:
            if (!hasAccess(msg)) break
            updates.registerChannel(client, msg, firebase)
            break

        case cmd.STOP:
            if (!hasAccess(msg)) break
            updates.unregisterChannel(client, msg, firebase)
            break

        case cmd.RERUN:
            if (!hasAccess(msg)) break
            updates.rerunCron(client, msg, firebase)
            break

        case cmd.ANIME:
            anime.showAnimeInfo(msg)
            break

        case cmd.MANGA:
            manga.showMangaInfo(msg)
            break

        case cmd.LINK:
            link.showLink(msg)
            break

        case cmd.CLAIMHUG:
            images.claimHug(msg)
            break

        case cmd.ABOUT:
            about.showAbout(msg)
            break

        default:
            if (msg.content.substring(PREFIX.length).startsWith(cmd.MIKUSAY)) {
                images.mikuSay(msg)
            } else {
                msg.channel.send('No such command!')
            }

    }
}

function hasAccess(msg) {
    if (msg.author.id != process.env.OWNER) {
        msg.channel.send('Some things are just not meant to be.')
        return false
    }
    return true
}

client.login(process.env.BOT_TOKEN)