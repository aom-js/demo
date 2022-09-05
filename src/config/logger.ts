import fs from "fs-extra";
import winston, { Logger } from "winston";

const { LOGS_DIR } = process.env;

export const errorLogs = `${LOGS_DIR}/error.log`;
export const commonLogs = `${LOGS_DIR}/combined.log`;

// создадим потоки для записи данных
const errorLogsStream = fs.createWriteStream(errorLogs, { flags: "a+" });
const commonLogsStream = fs.createWriteStream(commonLogs, { flags: "a+" });

const logger: Logger = winston.createLogger({
  // level: 'info',
  format: winston.format.json(),
  // defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.Stream({
      stream: errorLogsStream,
      level: "error",
    }),
    new winston.transports.Stream({
      stream: commonLogsStream,
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
