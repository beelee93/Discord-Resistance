import { Game } from '../index';
import { CommandHandler, CommandPacket, HandlerFunction } from '../../bot/commands/types';
import { getLogger } from '../../utils/logger';
import { Logger } from 'winston';
import { MessageEmbed, User } from 'discord.js';
import { isDMChannel, isGameChannel } from '../../utils/helper';
import { Configuration, getConfiguration } from '../../utils/configuration';

interface ResistanceState {
    dm : CommandHandler;
    text : CommandHandler;
}

export default class Resistance implements Game {
    name: string = "Resistance";
    gameMaster: User = null;
    logger: Logger;
    players: User[] = [];

    private voted: User[] = [];

    private config: Configuration;
    private state : ResistanceState;
    private previousState : ResistanceState;

    private beginState : ResistanceState;
    private endGameState : ResistanceState;


    constructor(initPacket: CommandPacket) {
        this.logger = getLogger();
        this.config = getConfiguration();
        this.gameMaster = initPacket.rawMessage.author;
        this.players.push(this.gameMaster);

        this.createStates();
        this.state = this.beginState;
        this.logger.info("Starting a game of Resistance!");
        this.commandInitGame(initPacket);
    }

    getHandler(packet: CommandPacket) : HandlerFunction {
        if (!this.state) return null;

        if (isDMChannel(packet.rawMessage)) {
            return this.state.dm[packet.operator];
        } else if(isGameChannel(packet.rawMessage)) {
            return this.state.text[packet.operator];
        }
    }

    changeState(state : ResistanceState) {
        this.previousState = this.state;
        this.state = state;
    }

    resetVotes() {
        this.voted = [];
    }

    putVote(user: User) {
        if (this.voted.find(p => p.id === user.id)) return;
        this.voted.push(user);
    }

    createStates = () => {
        this.beginState = {
            dm: {},
            text: {
                join: this.commandPlayerJoin,
                start: this.commandStartGame,
                list: this.commandListPlayers,
                pullout: this.commandPlayerPullOut,
                end: this.commandEndGame
            }
        }

        this.endGameState = {
            dm: {},
            text: {
                vote: this.commandEndGameVote
            }
        }
    }

    commandInitGame = async (packet: CommandPacket) => {
        await packet.rawMessage.channel.send(`Starting a game of **Resistance**! Respond only on this channel or through your DMs.`);
        await packet.rawMessage.channel.send(`If you are playing, type **${this.config.prefix} join**`);
    }

    commandPlayerJoin = async (packet: CommandPacket)=> {
        this.logger.debug(`commandPlayerJoin: ${packet.rawMessage.author.username}`);
        let user = packet.rawMessage.author;

        if(this.players.find(p => p.id === user.id)) {
            return; // already exists
        }

        this.logger.info(`User ${user.username} joins the game`);
        await packet.rawMessage.channel.send(`<@${user.id}> joins the game`);

        this.players.push(user);
    }

    commandStartGame = async (packet: CommandPacket) => {
        this.logger.debug(`commandStartGame: ${packet.rawMessage.author.username}`);

        if (this.players.length < 5) {
            await packet.rawMessage.channel.send(`Please find more friends, you donkey.`);
            return;
        }
    }

    commandListPlayers = async (packet: CommandPacket) => {
        this.logger.debug(`commandListPlayers: ${packet.rawMessage.author.username}`);

        let playerList = this.players.map(p => {
            if(p.id === this.gameMaster.id) return `:crown: <@${p.id}>`;
            return `<@${p.id}>`;
        })
        .join('\r\n');
        await packet.rawMessage.channel.send(`List of mofo playing this shit :poop::\r\n${playerList}`);
    }

    commandPlayerPullOut =  async (packet: CommandPacket) => {
        this.logger.debug(`commandPlayerPullOut: ${packet.rawMessage.author.username}`);

        var userId = packet.rawMessage.author.id;
        let index = this.players.findIndex(p => p.id === userId);
        if (index >= 0) {
            await packet.rawMessage.channel.send(`<@${userId}> Pull out game strong lolz`);
            this.players.splice(index,1);
        }
        else {
            await packet.rawMessage.channel.send(`What you doing, <@${userId}>? pp too smol, you not even in.`);
        }
    }

    commandEndGame = async (packet: CommandPacket) => {
        this.logger.debug(`commandEndGame: ${packet.rawMessage.author.username}`);

        this.changeState(this.endGameState);

        this.putVote(packet.rawMessage.author);
        await packet.rawMessage.channel.send(`End game (Vote ${this.voted.length}/3)`);
    }

    commandEndGameVote = async (packet: CommandPacket) => {
        this.logger.debug(`commandVote: ${packet.rawMessage.author.username}`);

        this.putVote(packet.rawMessage.author);
        await packet.rawMessage.channel.send(`End game (Vote ${this.voted.length}/3)`);

        if (this.voted.length >= 3) {
            this.config.currentGame = null;
            this.config.currentGameChannel = null;
    
            await packet.rawMessage.channel.send(`Ended ${this.name} game`);
        }
    }

}