require('dotenv').config()
let path = require('path')

const discord = require('discord.js')
const updates = requireFile('updates.js')
const anime = requireFile('anime.js')
const manga = requireFile('manga.js')
const images = requireFile('images.js')
const about = requireFile('about.js')

const client = new discord.Client()
const embed = new discord.RichEmbed()
const prefix = '6t-'

const cmd = {
    START: 'start',
    STOP: 'stop',
    RERUN: 'rerun',
    ANIME: 'anime',
    MANGA: 'manga',
    PLSHUG: 'plshug',
    HUGMIKU: 'hugmiku',
    ABOUT: 'about'
}

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
    if (msg.content.startsWith(prefix)) {
        checkCommand(client, msg)
    }
})

function requireFile(filename) {
    return require(path.resolve('command', filename))
}

function checkCommand(client, msg) {
    switch (msg.content.substring(prefix.length)) {
        case cmd.START:
            if (!hasAccess(msg)) break
            updates.registerChannel(client, msg)
            break

        case cmd.STOP:
            if (!hasAccess(msg)) break
            updates.unregisterChannel(client, msg)
            break

        case cmd.RERUN:
            if (!hasAccess(msg)) break
            updates.rerunCron(client, msg)
            break

        case cmd.ANIME:
            anime.showAnimeInfo(embed, msg)
            break

        case cmd.MANGA:
            manga.showMangaInfo(embed, msg)
            break

        case cmd.MIKUSAD:
            images.showMikuSad(msg)
            break

        case cmd.PLSHUG:
            images.showPlsHug(msg)
            break

        case cmd.ABOUT:
            about.showAbout(msg, process.env.GITHUB_LINK)
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