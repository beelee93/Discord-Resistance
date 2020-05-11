import { Game } from '../index';
import { CommandHandler, CommandPacket } from '../../bot/commands/types';
import { getLogger } from '../../utils/logger';
import { Logger } from 'winston';
import { MessageEmbed } from 'discord.js';

export default class Resistance implements Game {
    commandHandler: CommandHandler;
    name: string = "Resistance";
    logger: Logger;

    constructor(initPacket: CommandPacket) {
        this.logger = getLogger();
        this.commandHandler = {

        };

        this.logger.info("Starting a game of Resistance!");
        initPacket.rawMessage.channel.send(`Starting a game of **Resistance**! Respond only on this channel or through your DMs.`)
        .catch(this.logger.error);
    }
}