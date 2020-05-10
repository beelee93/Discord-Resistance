import winston from 'winston';
import { Container } from 'typedi';
import { LoggerServiceKey } from './constants';
import moment from 'moment';

const { combine, timestamp, label, printf, prettyPrint } = winston.format;

const formatter = printf((info) => {
    var output = `--> ${moment(info.timestamp).format('YYYY-MM-DD HH:mm:ss')} [${info.level}] `;
    if (info instanceof Error) {
        let e = info as Error;
        output += e.message;
        output += "\n" + e.stack;
    }
    else {
        output += info.message;
    }

    return output;
});

function createLogger() {
    const logger = winston.createLogger({
        level: process.env.NODE_ENV === 'production' ? 'info': 'debug',
        format: combine(
            timestamp(),
            formatter
        ),
        transports: [
            new winston.transports.Console()
        ]
      });
    return logger;
}

export default createLogger;

export function getLogger() {
   return Container.get<winston.Logger>(LoggerServiceKey);
}