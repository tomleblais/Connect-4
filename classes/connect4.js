const { teams, inARow } = require("../json/config.json")
const { User, MessageEmbed } = require("discord.js")

const maxTeamsCount = Object.keys(teams).length

class Game extends Array {
    constructor(users, msg, callback) {
        super()

        if (users.lenght < 2)
            throw new Error("Nombre de participants insuffisant")

        this.colsCount = 7
        this.rowsCount = 6
        this.teams = []
        this.players = new PlayerCollection(this, users)
        this.callback = callback

        for (let i = 1; i <= this.colsCount; i++) {
            this.push(new SlotCollection(i, this.rowsCount))
        }

        this.embedTemplateMessage = new MessageEmbed()
            .setColor("#ffff00")
            .setTitle("Puissance 4")
            .setTimestamp()
        
        this.teams.forEach((team) => {
            let players = ""
            team.players.forEach((player) => {
                players = players.concat(`- ${player.user.username}\n`)
            })
            this.embedTemplateMessage
                .addField(`${team.char} Team ${team.color}`, players)
        })

        msg.channel.send({ embed: this.embedTemplateMessage })
            .then(msg => {
                this.embedMessage = msg
                this.updateMessage()
            })
            .catch(console.error)
    }
    fetchSlotCollection(index) {
        return this.find((collection) => collection.index === index)
    }
    drop(index, user) {
        let team = this.teams.find((team) => team.match(user))
        let collection = this.fetchSlotCollection(index)
        if (collection) {
            if (collection.drop(team)) {
                this.updateMessage()
                return true
            }
        }
        let winningTeam = this.checkConnecting()
        if (winningTeam)
            this.callback(winningTeam)
        return
    }
    checkConnecting() {
        for (const team of this.teams) {
            let index = 0
            for (const collection of this) {

                const upDiagonal = []
                const downDiagonal = []

                if (collection.checkConnecting(team))
                    return team
                
                const row = []
                for (let x = 0; x < this.rowsCount; x++) {
                    row.push(collection[x])

                    for (let y = index; y < inARow; y++) {
                        downDiagonal.push(this[y][x])
                        upDiagonal.push(this[x][y])
                    }

                    const slots = []
                    for (let y = 0; y <= inARow; y++) {
                        if (this[x + inARow] !== undefined)
                            slots.push(this[x + inARow])
                        else
                            break
                    }
                    if (slots.length === 4) {
                        if (slots.every((slot) => { (slot.disc !== null && slot.disc.team.id === team.id) }))
                            return team
                    }
                }
                if (upDiagonal.length === 4) {
                    if (upDiagonal.every((slot) => { (slot.disc !== null && slot.disc.team.id === team.id) }))
                        return team
                }
                if (downDiagonal.length === 4) {
                    if (downDiagonal.every((slot) => { (slot.disc !== null && slot.disc.team.id === team.id) }))
                        return team
                }
                index++
            }
        }
        return
    }
    updateMessage() {
        this.embedTemplateMessage
            .setDescription(this.toString())
            .setTimestamp()
        this.embedMessage.edit(this.embedTemplateMessage)
    }
    toString() {
        let out = ""
        for (let y = 0; y < this.rowsCount; y++) {
            out = out.concat("│ ")
            for (let x = 0; x < this.colsCount; x++) {
                out = out.concat(this[x][y].toString(), " ")
            }1
            out = out.concat("│\n")
        }
        return out.concat("│ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ │")
    }
}
class Player {
    constructor(user, team) {
        this.user = user
        this.team = team
    }
    match(user) {
        if (user.id === this.user.id)
            return true
        return false
    }
}
class PlayerCollection extends Array {
    constructor(game, users) {
        super()
        this.game = game
        let colors = Object.keys(teams)
        users.shuffle().forEach((user, i) => {
            let id = i - maxTeamsCount > 0 ? i - maxTeamsCount : i
            console.log(id)
            let team = this.game.teams.push(new Team(id, colors[id]))
            if (user instanceof User) {
                let player = new Player(user, this.game.teams[id])
                this.push(player)
                this.game.teams[team - 1].addPlayer(player)
            }
        })
    }
    fetchPlayer(user) {
        for (const player of this) {
            if (player.match(user))
                return player
        }
        return false
    }
}
class Disc {
    constructor(slot, team) {
        this.slot = slot
        this.team = team
    }
    toString() {
        return this.team.char
    }
}
class Slot {
    constructor(index) {
        this.index = index
        this.disc = null
    }
    toString() {
        if (this.disc !== null)
            return this.disc.team.char
        else
            return '⬛'
    }
}
class SlotCollection extends Array {
    constructor(index, rowsCount=6) {
        super()
        this.index = index

        for (let i = 1; i <= rowsCount; i++) {
            this.push(new Slot(i))
        }
    }   
    drop(team) {
        let slot = this.find((slot, i) => {
            if (slot.disc === null) {
                return (this[i + 1] === undefined || this[i + 1].disc !== null)
            }
        })
        if (slot !== undefined) {
            slot.disc = new Disc(slot, team)
            return true
        }
        return
    }
    checkConnecting(team) {
        for (let x = 0; x < this.length; x++) {
            const slots = []
            for (let y = 0; y <= inARow; y++) {
                if (this[x + inARow] !== undefined)
                    slots.push(this[x + inARow])
                else
                    break
            }
            if (slots.length === 4) {
                if (slots.every((slot) => { (slot.disc !== null && slot.disc.team.id === team.id) }))
                    return team
            }
        }
        return false
    }
}
class Team extends Number {
    constructor(id, color) {
        super(id)
        if (teams[color] !== undefined) {
            this.color = color
            this.char = teams[color].char
            this.players = []
        } else {
            throw new Error("Nom de team invalide")
        }
    }
    addPlayer(player) {
        if (player instanceof Player) {
            return this.players.push(player)
        }
        return undefined
    }
    match(user) {
        return this.players.find((player) => {
            return player.user.id === user.id
        })
    }
}

/**
 * Mélange aléatoirement le contenu du tableau
 */
Array.prototype.shuffle = function () {
    let counter = this.length
    while (counter > 0) {
        let index = Math.floor(Math.random() * counter)
        counter--
        let temp = this[counter]
        this[counter] = this[index]
        this[index] = temp
    }
    return this
}
module.exports = { Game }