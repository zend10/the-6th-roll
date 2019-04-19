let path = require('path')
let fs = require('fs')

let mangaInfoPath = path.resolve('save', 'mangaInfo.json')
let methods = {}

methods.showMangaInfo = function(embed, msg) {
    if (!fs.existsSync(mangaInfoPath)) {
        fs.writeFileSync(mangaInfoPath, '')
    }

    let mangaInfo = JSON.parse(fs.readFileSync(mangaInfoPath, 'utf8'))

    const info = embed
        .setTitle(mangaInfo.title)
        .setURL(mangaInfo.url)
        .setThumbnail(mangaInfo.thumbnail)
        .setDescription(mangaInfo.description)
        .setImage(mangaInfo.image)
        .setFooter(mangaInfo.footer)
        
    msg.channel.send(info)
}

module.exports = methods