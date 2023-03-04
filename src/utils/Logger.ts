import * as dayjs from "dayjs";
import * as path from "path";
import { createLogger, format, transports } from "winston";

type LoggerInfo = {
  level: string;
  message: string;
  stack?: Error["stack"];
};

const dateFormat = () => dayjs().format("YYYY-MM-DD / HH:mm:ss");

const enumerateErrorFormat = format((info) => {
  if (info.stack) {
    return {
      ...info,
      message: info.message,
      stack: info.stack,
    };
  }
  return info;
});

const consoleOutputFormat = format.combine(
  enumerateErrorFormat(),
  format.errors({ stack: true }),
  format.colorize(),
  format.printf((info: LoggerInfo) => {
    if (info.stack) {
      return `${dateFormat()} | ${info.level} | ${info.message} | ${
        info.stack
      }`;
    }
    return `${dateFormat()} | ${info.level} | ${info.message}`;
  })
);

export const logger = createLogger({
  level: "info",
  format: consoleOutputFormat,
  defaultMeta: { service: "user-service" },
  exitOnError: false,
  transports: [
    new transports.File({
      filename: path.resolve("./logs/error.log"),
      level: "error",
    }),
    new transports.File({
      filename: path.resolve("./logs/info.log"),
      level: "info",
    }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.simple(),
    })
  );
}

const logs = (
  type: "info" | "debug" | "error",
  message: string | Error,
  data?: unknown
) => {
  let logMsg = message;
  if (typeof data === "object") {
    logMsg = `${message} | ${JSON.stringify(data)}`;
  } else if (typeof data === "number" || typeof data === "string") {
    logMsg = `${message} ${data}`;
  }
  logger.log(type, logMsg);
};

export const logInfo = (message: any, data?: unknown): void => {
  logs("info", message, data);
};
export const logDebug = (message: any, data?: unknown): void => {
  logs("debug", message, data);
};
export const logError = (message: any, data?: Error | unknown): void => {
  if (data instanceof Error) {
    const result = {
      ...data,
      stack: data.stack,
      message: `${message} | ${data.message}`,
    };

    logs("error", result);
    return;
  }
  logs("error", message);
};
