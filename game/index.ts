import { HandlerFunction, CommandPacket } from '../bot/commands/types';

export interface Game {
    name: string;
    getHandler(packet: CommandPacket) : HandlerFunction;
}