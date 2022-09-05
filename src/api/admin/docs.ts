import { OpenApi } from "aom";
import { url } from "./init";

const Doc = new OpenApi({
  info: {
    title: "Demo admin api documentation",
    description: "Демонстрационная документация для API админки",
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
