const winston = require("winston");

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.metadata({
    fillExcept: ["message", "level", "timestamp", "service"],
  }),
  winston.format.printf(({ level, message, service, timestamp }) => {
    return `[${level}] [${timestamp}] [${service}] ${message}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.metadata({
    fillExcept: ["message", "level", "timestamp", "service"],
  }),
  winston.format.printf(({ level, message, service, timestamp }) => {
    return `[${level}] [${timestamp}] [${service}] ${message}`;
  })
);

class WinstonLogger {
  /**
   *
   * @param {String} serviceName
   */
  constructor(serviceName) {
    this.serviceName = serviceName || "Node.js App";
  }

  info(message) {
    const log = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.metadata({
          fillExcept: ["message", "level", "timestamp", "service"],
        }),
        winston.format.splat(),
        winston.format.errors({ stack: true }),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.json()
      ),
      defaultMeta: { service: `${this.serviceName}` },
      transports: [
        new winston.transports.Console({ format: consoleFormat }), // Log to console with colors
        new winston.transports.File({
          filename: "logs/error.log",
          level: "error",
          format: fileFormat,
        }),
        new winston.transports.File({
          filename: "logs/info.log",
          level: "info",
          format: fileFormat,
        }),
        new winston.transports.File({
          filename: "logs/combined.log",
          format: fileFormat,
        }),
      ],
    });
    return log.info(message || "");
  }
  error(message) {
    const log = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.metadata({
          fillExcept: ["message", "level", "timestamp", "service"],
        }),
        winston.format.splat(),
        winston.format.errors({ stack: true }),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.json()
      ),
      defaultMeta: { service: `${this.serviceName}` },
      transports: [
        new winston.transports.Console({ format: consoleFormat }), // Log to console with colors
        new winston.transports.File({
          filename: "logs/error.log",
          level: "error",
          format: fileFormat,
        }),
        new winston.transports.File({
          filename: "logs/info.log",
          level: "info",
          format: fileFormat,
        }),
        new winston.transports.File({
          filename: "logs/combined.log",
          format: fileFormat,
        }),
      ],
    });
    return log.error(message || "");
  }
}
const ServiceLogger = new WinstonLogger("Discord Bot");

module.exports = { ServiceLogger };
