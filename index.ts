import dotenv from 'dotenv';
import { Container } from 'typedi';
import createLogger from "./utils/logger";
import createBot from './bot';
import { BotServiceKey, LoggerServiceKey } from './utils/constants';

// initialize environment variables from .env file
dotenv.config();

const logger = createLogger();
Container.set(LoggerServiceKey, logger);

const bot = createBot();
Container.set(BotServiceKey, bot);
