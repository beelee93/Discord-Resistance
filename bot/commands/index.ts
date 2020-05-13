import { Message, Client } from "discord.js";
import { Container } from 'typedi';
import { HandlerServiceKey as ParserServiceKey } from '../../utils/constants';
import { CommandPacket, CommandArgument, CommandArgumentType, CommandHandler } from './types';
import { getBot } from '../index';
import { getLogger } from '../../utils/logger';
import { Logger } from "winston";
import { getConfiguration, Configuration } from '../../utils/configuration';
import Resistance from '../../game/resistance/index';
import { isGameChannel, isTextChannel, isDMChannel } from '../../utils/helper';

class CommandParser {
    private logger: Logger;
    private config: Configuration;
    private handler: CommandHandler;

    constructor() {
        this.logger = getLogger();
        this.config = getConfiguration();
        this.handler = {
            start: this.commandStartGame,
            end: this.commandEndGame
        }
    }

    parse(args: Message) { 
        var split = args.content.split(/\s/).filter(s => s.length > 0);

        // split[0] is always the prefix
        if (split.length < 2) return;

        var packet : CommandPacket = {
            operator: split[1],
            data: [],
            rawMessage: args
        };

        for (let i=2;i<split.length;i++) {
            let word = split[i];
            let curArg : CommandArgument = {
                type: CommandArgumentType.String,
                value: word,
                raw: word
            };
            packet.data.push(curArg);

            // look for user mentions and resolve
            let matches = word.match(/^<@!?(\d+)>$/);
            if (!matches) 
                continue;

            let id = matches[1];
            let mentionedUser = args.mentions.users.get(id);

            curArg.type = CommandArgumentType.MentionUser;
            curArg.value = mentionedUser;
        }

        // if a game is running, we route it into its command handler
        if (this.config.currentGame) {
            let gameHandler = this.config.currentGame.getHandler(packet);
            if (gameHandler) {
                this.logger.debug(`Calling game handler ${gameHandler.name} for operator ${packet.operator}`);
                gameHandler(packet);
                return;
            }
        }

        // now we attempt to pass it into the appropriate handler method
        let handlerMethod = this.handler[packet.operator];
        if (handlerMethod) {
            this.logger.debug(`Calling handler ${handlerMethod.name} for operator ${packet.operator}`);
            handlerMethod(packet);
        }
        else {
            this.logger.warn(`No handler for operator ${packet.operator}`);
            packet.rawMessage.reply(`**D O N K E Y**`);
        }
    }

    commandStartGame = (packet: CommandPacket) => {
        if (this.config.currentGame) {
            this.logger.warn('A user attempted to start a game when a game is still in progress.');
            packet.rawMessage.channel.send(`${this.config.currentGame.name} is in progress. \n` + 
                `You may end it using **${this.config.prefix} end**`)
                .catch(this.logger.error);
            return;
        }

        if (packet.data.length == 0) {
            packet.rawMessage.channel.send(`Yo, you need to tell me what game you want to play... \n` + 
            `You may begin one using **${this.config.prefix} start Resistance**`)
            .catch(this.logger.error);
            return;
        }

        if (packet.data[0].raw.toLowerCase() === 'resistance') {
            this.config.currentGame = new Resistance(packet);
            this.config.currentGameChannel = packet.rawMessage.channel.id;
        } else {
            packet.rawMessage.channel.send(`What game is ${packet.data[0].raw}?`)
            .catch(this.logger.error);
        }
    }

    commandEndGame = (packet: CommandPacket) => {
        if (!this.config.currentGame) 
            return; // ignore if no running game

        if (!isGameChannel(packet.rawMessage)) {
            packet.rawMessage.channel.send(`You may end the game in the channel that it was started.\n` + 
            `Type **${this.config.prefix} end** in channel <#${this.config.currentGameChannel}>`)
            .catch(this.logger.error);
            return;
        }

        var lastgame = this.config.currentGame.name;
        this.config.currentGame = null;
        this.config.currentGameChannel = null;

        packet.rawMessage.channel.send(`Ended a ${lastgame} game`)
            .catch(this.logger.error);
    }
}

export function createCommandHandler() {
    return new CommandParser();
}

export function getParser() {
    return Container.get<CommandParser>(ParserServiceKey);
}