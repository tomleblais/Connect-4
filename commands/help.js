const { MessageEmbed } = require("discord.js")

module.exports = {
    name: "help",
    description: "Affiche une fiche d'aide",
    execute: (msg, args) => {
        const embedMessage = new MessageEmbed()
            .setColor("#ffff00")
            .setTitle("Fiche d'aide")
            .setAuthor("LeTomium", "https://avatars0.githubusercontent.com/u/44026536?s=60&v=4", "https://github.com/LeTomium/")
            .setTimestamp()
            .addFields(
                { name: "Créer une nouvelle partie", value: "`!new @Joueur_1 @Joueur_2`" },
                { name: "Ajouter un pion dans une colonne", value: "`!drop <n° de colonne>`" },
                { name: "Mettre fin à la partie courante", value: "`!close`" },
                { name: "Afficher cette fiche d'aide", value: "`!aide`" }
            )
        msg.channel.send(embedMessage)
    }
}