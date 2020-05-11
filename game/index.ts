import { CommandHandler } from '../bot/commands/types';

export interface Game {
    commandHandler: CommandHandler;
    name: string;
}