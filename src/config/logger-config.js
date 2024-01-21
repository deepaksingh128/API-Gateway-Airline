const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format; // destructuring format object

const customFormat = printf(( { level, message, timestamp } ) => {
    return `${timestamp} : ${level} : ${message}`;
});

const logger = createLogger({
    format: combine(
        timestamp({format: 'YYYY-mm-dd hh-mm-ss'}),
        customFormat
    ),
    transports:  [
        new transports.Console(),
        new transports.File({filename: 'combined.log'})
    ],
});

module.exports = logger;