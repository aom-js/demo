import { OpenApi } from "aom";
import { url } from "./init";

const Doc = new OpenApi({
  info: {
    title: "Users admin api documentation",
    description: "Документация для демонстрационного пользовательского API",
    contact: {
      name: "Kholstinnikov Grigory",
      email: "mail@scarych.ru",
    },
    version: "1.0.0",
  },
  servers: [
    {
      url,
      description: "current host",
    },
  ],
  openapi: "3.0.1",
});

export default Doc;
