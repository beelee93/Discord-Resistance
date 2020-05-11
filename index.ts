import dotenv from 'dotenv';
import { Container } from 'typedi';
import createLogger from "./utils/logger";
import createBot from './bot';
import { BotServiceKey, LoggerServiceKey, HandlerServiceKey, ConfigurationServiceKey } from './utils/constants';
import { createCommandHandler } from './bot/commands/index';
import { createConfiguration } from './utils/configuration';

// initialize environment variables from .env file
dotenv.config();

const logger = createLogger();
Container.set(LoggerServiceKey, logger);

const config = createConfiguration();
Container.set(ConfigurationServiceKey, config);

const handler = createCommandHandler();
Container.set(HandlerServiceKey, handler);

const bot = createBot();
Container.set(BotServiceKey, bot);
