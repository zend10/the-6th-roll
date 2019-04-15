require('dotenv').config()

const discord = require('discord.js')
const updates = require('./command/updates.js')
const help = require('./command/help.js')

const client = new discord.Client()
const prefix = '6.'

const cmd = {
    UPDATES: 'updates',
    HELP: 'help',
    ABOUT: 'about'
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', msg => {
    if (msg.content.startsWith(prefix)) {
        checkCommand(msg)
    }
})

function checkCommand(msg) {
    switch (msg.content.substring(prefix.length)) {
        case cmd.UPDATES:
            updates.manageUpdateCron(msg)
            break

        case cmd.HELP:
            help.showHelp(msg)
            break

        case cmd.ABOUT:
            break

        default:
            msg.channel.send('No such command!')
    }
}

client.login(process.env.BOT_TOKEN)