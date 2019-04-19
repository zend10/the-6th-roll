let path = require('path')
let fs = require('fs')

let animeInfoPath = path.resolve('save', 'animeInfo.json')
let methods = {}

methods.showAnimeInfo = function(embed, msg) {
    if (!fs.existsSync(animeInfoPath)) {
        fs.writeFileSync(animeInfoPath, '')
    }

    let animeInfo = JSON.parse(fs.readFileSync(animeInfoPath, 'utf8'))

    const info = embed
        .setTitle(animeInfo.title)
        .setURL(animeInfo.url)
        .setThumbnail(animeInfo.thumbnail)
        .setDescription(animeInfo.description)
        .addField(animeInfo.fieldName, animeInfo.fieldValue)
        .setImage(animeInfo.image)
        .setFooter(animeInfo.footer)
        
    msg.channel.send(info)
}

module.exports = methods