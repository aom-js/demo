/** компонента асинхронной отправки сообщений пользователям */

import _ from "lodash";
import kafka from "../index";
import * as prodivers from "./providers";

export class Pusher {
  producer;

  consumer;

  topic;

  // подключаемся к кафке
  constructor() {
    this.producer = kafka.producer();
    this.consumer = kafka.consumer({ groupId: "aom-push-messages" });
    this.topic = "aom-pusher";

    this.producer.connect();
  }

  service = async () => {
    const { consumer, topic } = this;
    await consumer.connect();
    await consumer.subscribe({
      topic,
      // fromBeginning: true
    });
    // на каждом входящем сообщении, вызываем функцию `send`, передавая в нее собственно
    await consumer.run({
      eachMessage: async (data) => {
        const { message } = data;
        await this.send(message);
      },
    });
  };

  /**  зарегистрировать сообщение на отправку
   * @params login <CustomerLogin | UserLogin>
   * @params message - данные сообщения
   * */
  async register(login, message) {
    const headers = _.pick(login, "type", "value");
    const value = JSON.stringify(message);
    const { producer, topic } = this;
    await producer.send({
      topic,
      messages: [{ headers, value }],
    });
  }

  // отправить полученное в кафке сообщение, используя стандартных провайдеров
  async send(message) {
    const { headers, key, value } = message;
    if (headers.type && prodivers[String(headers.type)]) {
      await prodivers[String(headers.type)](
        String(headers.value),
        JSON.parse(String(value))
      );
    }
  }
}

export default new Pusher();
