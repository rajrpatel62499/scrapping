const { createLogger, format, transports } = require("winston");
 
const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};
 
const logger = createLogger({
  levels: logLevels,
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.File({ filename: 'logs/file.log'})],
  exceptionHandlers: [new transports.File({ filename: "logs/exceptions.log" })],
  rejectionHandlers: [new transports.File({ filename: "logs/rejections.log" })],
  // transports: [new transports.Console({})],
  // exceptionHandlers: [new transports.Console({})],
  // rejectionHandlers: [new transports.Console({})],
});

module.exports = logger ;