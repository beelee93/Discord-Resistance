import { Container } from 'typedi';
import { ConfigurationServiceKey } from './constants';
import { Game } from '../game/index';

export class Configuration {
    prefix: string = "r";
    currentGame: Game = null;
    currentGameChannel: string = null;

    constructor() {
    }
}

export function createConfiguration() {
    return new Configuration();
}

export function getConfiguration() {
    return Container.get<Configuration>(ConfigurationServiceKey);
}