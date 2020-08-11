const { Game } = require("../classes/connect4.js")

module.exports = {
    name: "drop",
    desciption: "Ajoute un disque dans la colonne precisée",
    execute: (game, msg, args) => {
        for (const arg of args) {
            let column = parseInt(arg)
            if (arg !== NaN)
                game.drop(column, msg.author)
        }
        console.log(game.toString())
        msg.delete()
            .catch(console.err)
    }
}