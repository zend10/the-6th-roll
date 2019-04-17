require('dotenv').config()

const discord = require('discord.js')
const updates = require('./command/updates.js')
const anime = require('./command/anime.js')
const manga = require('./command/manga.js')
const about = require('./command/about.js')

const client = new discord.Client()
const prefix = '6t-'

const cmd = {
    START: 'start',
    RERUN: 'rerun',
    ANIME: 'anime',
    MANGA: 'manga',
    ABOUT: 'about'
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', msg => {
    if (msg.content.startsWith(prefix)) {
        // console.log(msg.author.id)
        checkCommand(client, msg)
    }
})

function checkCommand(client, msg) {
    switch (msg.content.substring(prefix.length)) {
        case cmd.START:
            if (!hasAccess(msg)) 
                break

            updates.manageCron(client, msg)
            break

        case cmd.RERUN:
            if (!hasAccess(msg)) 
                break

            updates.rerunCron(client, msg)
            break

        case cmd.ANIME:
            anime.showAnimeInfo(msg)
            break

        case cmd.MANGA:
            manga.showMangaInfo(msg)
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