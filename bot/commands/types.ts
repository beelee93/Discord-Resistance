import { Message } from 'discord.js';

export enum CommandArgumentType {
    String = 0,
    MentionUser = 1
}

export interface CommandArgument {
    type: CommandArgumentType;
    value: any;
    raw: string;
}

export interface CommandPacket {
    operator: string;
    data: CommandArgument[];
    rawMessage: Message;
}

export type HandlerFunction = (packet: CommandPacket) => void;

export interface CommandHandler {
    [key: string] : HandlerFunction;
}