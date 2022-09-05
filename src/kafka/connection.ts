import "config";
import { Kafka } from "kafkajs";

const { KAFKA_SERVER } = process.env;

const kafka = new Kafka({
  clientId: "aom-kafka",
  brokers: [KAFKA_SERVER],
  requestTimeout: 30000,
  retry: {
    initialRetryTime: 500,
    maxRetryTime: 10000,
    retries: 2000,
  },
  authenticationTimeout: 2000,
  connectionTimeout: 2000,
});

export default kafka;
