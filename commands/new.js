const { Game } = require("../classes/connect4.js")

function getUserFromMention(client, mention) {
    if (!mention) return

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1)

        if (mention.startsWith('!')) {
            mention = mention.slice(1)
        }

        return client.users.cache.get(mention)
    }
}

module.exports = {
    name: "new",
    description: "Crée une partie.",
    execute: (client, msg, args) => {
        let users = []
        args.forEach((arg) => {
            let user = getUserFromMention(client, arg)
            if (user !== undefined)
                users.push(user)
        })
        let game = new Game(users, msg, (winningTeam) => {
            console.log(winningTeam)
        })
        console.log(game)
        return game
    }
}