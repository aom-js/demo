import { OpenApi } from "aom";

import { url } from "./init";

const Doc = new OpenApi({
  info: {
    title: "Files API",
    description: "Документация для Files API",
    contact: {
      name: "Kholstinnikov Grigory",
      email: "mail@scarych.ru",
    },
    version: "1.0.0",
  },
  servers: [
    {
      url,
      description: "Current host",
    },
  ],
  openapi: "3.0.1",
});

export default Doc;
