import discord, { Client } from 'discord.js';
import { Container } from 'typedi';
import { BotServiceKey } from '../utils/constants';
import { getLogger } from '../utils/logger';
import { getParser } from './commands/index';
import { getConfiguration } from '../utils/configuration';

function createBot() {
    const logger = getLogger();
    const handler = getParser();
    const config = getConfiguration();

    const bot = new discord.Client();
    bot.once('ready', () => {
        logger.info('Bot is ready');
    })
    .on('message', args => {
        if (!args.content.startsWith(config.prefix))
            return; // ignore

        try {
            handler.parse(args);
        }
        catch (err) {
            logger.error(err);
        }
    }) 
    .on('error', (err) => {
        logger.error(err);
    });

    bot.login(process.env.AUTH_TOKEN);
    return bot;
}

export default createBot;

export function getBot() {
    return Container.get<Client>(BotServiceKey);
}