const fs = require("fs")

const Discord = require("discord.js")

const token = require("./json/token.json")
const config = require("./json/config.json")

const client = new Discord.Client()
client.commands = new Discord.Collection()

const games = new Map()

const commandFiles = fs.readdirSync('./commands').filter(file => {
    return file.endsWith('.js')
})

for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.name, command)
}

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", msg => {

    if (games.has(msg.channel.id)) {
        if (msg.author.id !== client.user.id) {
            msg.delete({
                timeout: 4000,
                reason: "Une partie est en cours"
            }).catch(err => {})
        }
    }

    if (!msg.content.startsWith(config.prefix)) return

    const args = msg.content.slice(config.prefix.length).trim().split(" ")
    const commandName = args.shift().toLowerCase()

    if (!client.commands.has(commandName)) return

    console.log(commandName)
    const command = client.commands.get(commandName)

    try {
        if (commandName === config.keywords.new) {
            if (!games.has(msg.channel.id)) {
                games.set(msg.channel.id, command.execute(client, msg, args))
            }
        } else if (commandName === config.keywords.drop) {
            if (games.has(msg.channel.id)) {
                let game = games.get(msg.channel.id)
                command.execute(game, msg, args)
            }
        } else if (commandName === config.keywords.close) {
            if (games.has(msg.channel.id)) {
                console.log(games.delete(msg.channel.id))
            }
        } else {
            command.execute(msg, args)
        }
    } catch(err) {
        msg.reply(`il y a eu une erreur lors de l'execution de la commande \`${config.prefix}${commandName} ${args.join(" ")}\` :/`)
        console.error(err)
    }
})

client.login(token.id)