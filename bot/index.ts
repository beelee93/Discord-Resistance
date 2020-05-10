import discord, { Client } from 'discord.js';
import { Container } from 'typedi';
import { BotServiceKey } from '../utils/constants';
import { getLogger } from '../utils/logger';

function createBot() {
    const logger = getLogger();
    const bot = new discord.Client();
    bot.once('ready', () => {
        logger.info('Bot is ready');
    })
    .on('presenceUpdate', (pold, pnew) => {
        logger.debug('presenceUpdate event');
    })
    .on('guildMemberUpdate', (...args) => {
        logger.debug('guildMemberUpdate');
    })
    .on('message', args => {
        logger.debug('message');
        args.channel.send(args.channel.id); 
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