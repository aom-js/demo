import _ from "lodash";
import { Context } from "koa";
import { Controller, Ctx, Cursor, ICursor } from "aom";
import { Middleware, Next, NextFunction, Responses, This } from "aom";
import { RateLimit, Stores } from "koa2-ratelimit";
import { ErrorMessage } from "common/api";
import { Constructor } from "aom/lib/common/declares";

const { REDIS_PASSWORD } = process.env;

if (!REDIS_PASSWORD) {
  throw new Error(`process.env.REDIS_PASSWORD is required!`);
}

class RateLimitResponse extends ErrorMessage {
  static status = 429;

  static description = "Превышено количество запросов";
}

type RateLimitedRoute = Constructor & { rateLimiter: RateLimiter };

const storeClient = new Stores.Memory();

RateLimit.defaultOptions({
  store: storeClient,
});

interface IRateLimiter {
  safeRequests: number;
  maxRequests: number;
  inSeconds: number;
  waitSeconds: number;
}
@Controller()
export class RateLimiter implements IRateLimiter {
  safeRequests = 10;

  maxRequests = 20;

  inSeconds = 1;

  waitSeconds = 0;

  static prefixMap: Map<string, any> = new Map();

  constructor(params: IRateLimiter) {
    Object.assign(this, params);
    return this;
  }

  getMapMiddleware(prefix, originConstructor: RateLimitedRoute) {
    //
    if (!RateLimiter.prefixMap.has(prefix)) {
      const { rateLimiter = this } = originConstructor;
      const limiterMiddleware = RateLimit.middleware({
        interval: { sec: rateLimiter.inSeconds }, //
        delayAfter: rateLimiter.safeRequests, // begin slowing down responses after the first request
        timeWait: rateLimiter.waitSeconds * 1000, //
        max: rateLimiter.maxRequests, // start blocking after N requests
        prefixKey: prefix, // to allow the bdd to Differentiate the endpoint
        keyGenerator: (ctx) => {
          return (
            prefix +
            (_.get(ctx, "session.uid") || ctx.get("x-real-ip") || ctx.ip)
          );
        },
        handler: (...args) => {
          throw new RateLimitResponse(RateLimitResponse.description);
        },
      });
      RateLimiter.prefixMap.set(prefix, limiterMiddleware);
    }
    return RateLimiter.prefixMap.get(prefix);
  }

  @Middleware()
  @Responses(RateLimitResponse.toJSON())
  static async Attach(
    @Ctx() ctx: Context,
    @Next() next: NextFunction,
    @This() rateLimiter: RateLimiter,
    @Cursor() cursor: ICursor
  ) {
    const { prefix } = cursor;
    const middleware = rateLimiter.getMapMiddleware(
      prefix,
      <RateLimitedRoute>cursor.origin.constructor
    );
    const _next = await next();
    return middleware(ctx, _next);
  }
}
