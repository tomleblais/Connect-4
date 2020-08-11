module.exports = {
    name: "help",
    description: "Affiche une fiche d'aide",
    execute: (msg, args) => {
        msg.channel.send("Fiche d'aide")
    }
}