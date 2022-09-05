import _ from "lodash";
import { logger } from "config";
import { WithSockets } from "common/controllers";
import kafka from "../index";

const { KAFKA_INSTANCE_KEY = "" } = process.env;
interface ISocketName {
  name: string;
}

export const KafkaSockets = (socketConstructor: WithSockets<ISocketName>) => {
  const { name, sockets } = socketConstructor;

  const groupId = `sockets_${KAFKA_INSTANCE_KEY}_${name}`;
  const topic = `topic_${groupId}`;
  const producer = kafka.producer();
  const consumer = kafka.consumer({
    groupId,
  });

  sockets.listener = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic });

    await consumer.run({
      eachMessage: async ({ message }) => {
        const { value, headers } = message;
        // если указан получатель, то отправим его конкретному пользователю
        if (headers.dataId) {
          sockets.send(String(headers.dataId), JSON.parse(String(value)));
        } else {
          // иначе - опубликуем по всем подключениям
          sockets.broadcast(JSON.parse(String(value)));
        }
      },
    });
  };

  const connection = async () => {
    // подключение kafka для отправки сообщений в сокеты
    await producer.connect();
  };

  connection().catch(logger.error);

  return async (message, dataId?) => {
    const headers = {};
    if (dataId) {
      Object.assign(headers, { dataId: String(dataId) });
    }
    await producer.send({
      topic,
      messages: [{ headers, value: JSON.stringify(message) }],
    });
  };
};

export default KafkaSockets;
