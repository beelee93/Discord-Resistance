import { Message, Channel } from "discord.js";
import { getConfiguration } from './configuration';

export function isGameChannel(msg: Message) {
    return getConfiguration().currentGameChannel === msg.channel.id;
}

export function isTextChannel(msg: Message) {
    return msg.channel.type === 'text';
}