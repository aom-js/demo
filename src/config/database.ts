import fs from "fs";
import mongoose from "mongoose";
import logger from "./logger";

const { DB_HOST, DB_NAME, DB_PORT = 27017 } = process.env;

if (!DB_HOST) {
  throw new Error(`process.env.DB_HOST not defined`);
}
if (!DB_NAME) {
  throw new Error(`process.env.DB_NAME not defined`);
}

const database = { server: DB_HOST, name: DB_NAME, port: DB_PORT };

const options = {
  keepAlive: true,
  keepAliveInitialDelay: 30000,
};

const { DB_CERT, DB_LOGIN, DB_PASSWORD } = process.env;

if (DB_CERT) {
  if (fs.existsSync(DB_CERT)) {
    Object.assign(options, { ssl: true, sslCA: DB_CERT });
  } else {
    throw new Error(`process.env.DB_CERT not exists ${DB_CERT}`);
  }
}

if (DB_LOGIN && DB_PASSWORD) {
  Object.assign(options, { user: DB_LOGIN, pass: DB_PASSWORD });
}

// mongoose.Promise = Promise;

// connect to db

const connect = () => {
  const connection = `mongodb://${database.server}:${database.port}/${database.name}`;
  console.log("connect to", connection, options);
  return mongoose.connect(connection, {
    ...options,
  });
};
export const connection = connect();
export const db = mongoose.connection;
// console.log("connection is", connection, db);

db.on("connecting", function () {
  logger.info("connecting to MongoDB...");
});

db.on("error", function (error) {
  logger.error(`Error in MongoDb connection: ${error}`);
  mongoose.disconnect();
});

db.on("connected", function () {
  logger.info("MongoDB connected!");
});
db.once("open", function () {
  logger.info("MongoDB connection opened!");
});
db.on("reconnected", function () {
  logger.info("MongoDB reconnected!");
});
db.on("disconnected", function () {
  logger.info("MongoDB disconnected!");
  connect();
});

export default connection;
