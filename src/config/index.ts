import "reflect-metadata";
import "env";

import "./init";
import connection from "./database";
import logger from "./logger";

const { NODE_ENV = "development" } = process.env;

export { logger };

/* eslint-disable */
export const config = require(`../../.config.${NODE_ENV}.json`);

logger.info("config installed", NODE_ENV, config, connection);
