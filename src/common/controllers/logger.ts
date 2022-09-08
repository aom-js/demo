import { Context, Request } from "koa";
import { nanoid } from "nanoid";
import logger from "config/api-logger";
import { Controller, Ctx, Cursor, ICursor, IRoute, Middleware } from "aom";
import { Next, NextFunction, Route, StateMap, This } from "aom";

class LoggerAttachments {
  result;

  constructor(constructor: any, stateMap: WeakMap<any, any>) {
    this.result = () => stateMap.get(constructor);
  }

  toJSON() {
    return Reflect.apply(this.result, null, []);
  }
}

@Controller()
export class Logger {
  request: Request; // данные запроса

  idempotenceKey: string; // уникальный ключ запроса

  currentDate: Date; // дата записи

  startDate: Date; // время начала запроса

  finishDate: Date; // время завершения запроса

  route: IRoute; // выполняемый маршрут

  status: number; // итоговый статус

  lifetime: number; // время жизни запроса

  duration: number; // длительность выполнения запроса

  error: Error; // ошибка в запросе

  attachments = {}; // приложения

  constructor() {
    this.idempotenceKey = nanoid();
    this.startDate = new Date();
    this.lifetime = 0;
    this.duration = 0;
  }

  @Middleware()
  static async Init(
    @Route() route: IRoute,
    @This() log: Logger,
    @Ctx() ctx: Context,
    @Next() next: NextFunction
  ) {
    // в общем случае onerror всегда выполняется в конце, что позволяет мне зафиксировать время окончания запроса
    // и статус его завершения, и, в случае ошибки, саму ошибку
    ctx.onerror = () => {
      log.currentDate = new Date();
      log.finishDate = new Date();
      log.status = ctx.status;
      log.lifetime = +log.currentDate - +log.startDate; // время жизни запроса
      log.duration = +log.finishDate - +log.startDate; // длительность запроса

      if (log.status !== 200) {
        log.error = ctx.body as Error;
        logger.error("request error", log);
      } else {
        logger.info("request success", log);
      }
    };

    log.currentDate = new Date();

    log.request = ctx.request;

    log.route = route;

    Object.assign(ctx, { log });
    logger.info("request initiated", log);
    return next();
  }

  @Middleware()
  static async Attach(
    @Cursor() cursor: ICursor,
    @StateMap() stateMap: WeakMap<any, any>,
    @This() log: Logger,
    @Next() next: NextFunction
  ) {
    const { origin } = cursor;
    // добавить в приложения к логированию указанный middleware/enpoint
    // извлекает origin, приложенный к курсору, и создает сущность, которая в момент составления лога извлекает
    // значение из stateMap
    // /*
    Object.assign(log.attachments, {
      [origin.constructor.name]: new LoggerAttachments(
        origin.constructor,
        stateMap
      ),
    });
    // */
    return next();
  }

  @Middleware()
  static async Watch(
    @This() log: Logger,
    @Cursor() cursor: ICursor,
    @Next() next: NextFunction
  ) {
    log.currentDate = new Date();
    log.lifetime = +log.currentDate - +log.startDate;
    const { origin } = cursor;
    const fragment = {
      prefix: cursor.prefix,
      constructor: origin.constructor.name,
      property: origin.property,
    };
    logger.info("request fragment", { ...log, fragment });
    return next();
  }
}
