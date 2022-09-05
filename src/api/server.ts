import koa from "koa";
import body from "koa-body";
import koaRouter from "koa-router";
import websocket from "koa-easy-ws";
import { $ } from "aom";
import cors from "@koa/cors";
import { logger } from "config";
import { NotFoundResponse } from "common/api";
import { PATH_NOT_FOUND } from "common/constants";

export interface IApiSettings {
  port: number;
  url?: string;
  origin?: string;
}

export default class Server {
  constructor($aom: $, settings: IApiSettings) {
    const server = new koa();
    server.use(body({ multipart: true, formLimit: "50mb" }));
    server.use(websocket());
    server.use(cors({ credentials: true }));

    const router = new koaRouter();

    $aom.eachRoute(({ method, path, middlewares }) => {
      router[method](path, ...middlewares);
    });

    server.use(router.routes()).use(router.allowedMethods());

    // standart 404 response if path wasn't found
    server.use((ctx) => {
      ctx.body = new NotFoundResponse(PATH_NOT_FOUND);
      ctx.status = NotFoundResponse.status;
    });
    server.listen(settings.port);
    console.info("server started", { settings });
  }
}
