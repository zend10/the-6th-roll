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
let anime = requireFile('anime.js')
let manga = requireFile('manga.js')
let images = requireFile('images.js')
let about = requireFile('about.js')

let client = new discord.Client()
let embed = new discord.RichEmbed()

const PREFIX = '6t-'

const cmd = {
    START: 'start',
    STOP: 'stop',
    RERUN: 'rerun',
    ANIME: 'anime',
    MANGA: 'manga',
    PLSHUG: 'plshug',
    ABOUT: 'about'
}

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
            anime.showAnimeInfo(embed, msg)
            break

        case cmd.MANGA:
            manga.showMangaInfo(embed, msg)
            break

        case cmd.PLSHUG:
            images.showPlsHug(msg)
            break

        case cmd.ABOUT:
            about.showAbout(msg)
            break

        default:
            msg.channel.send('No such command!')
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