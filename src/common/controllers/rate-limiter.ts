import _ from "lodash";
import { Context } from "koa";
import { Middleware, Responses, This } from "aom";
import { Controller, Ctx, Cursor, ICursor } from "aom";
import { RateLimit, Stores } from "koa2-ratelimit";
import { ErrorMessage } from "common/api";
import { Constructor } from "aom/lib/common/declares";

const { REDIS_PASSWORD } = process.env;

if (!REDIS_PASSWORD) {
  throw new Error(`process.env.REDIS_PASSWORD is required!`);
}

const RateLimitResponse = {
  status: 429,
  schema: ErrorMessage,
  description: "Превышено количество запросов",
};

type RateLimitedRoute = Constructor & { rateLimiter: RateLimiter };

const storeClient = new Stores.Redis({
  host: "localhost",
  port: 6379,
  enable_offline_queue: false,
  password: `${process.env.REDIS_PASSWORD}`,
});

RateLimit.defaultOptions({
  store: storeClient,
});

@Controller()
export class RateLimiter {
  maxRequests = 20;

  inSeconds = 1;

  static prefixMap: Map<string, any> = new Map();

  getMapMiddleware(prefix, originConstructor: RateLimitedRoute) {
    //
    if (!RateLimiter.prefixMap.has(prefix)) {
      const rateLimiter = originConstructor.rateLimiter || this;
      const limiterMiddleware = RateLimit.middleware({
        interval: { sec: rateLimiter.inSeconds }, //
        delayAfter: 1, // begin slowing down responses after the first request
        timeWait: 3 * 1000, // slow down subsequent responses by 3 seconds per request
        max: rateLimiter.maxRequests, // start blocking after N requests
        prefixKey: prefix, // to allow the bdd to Differentiate the endpoint
        keyGenerator: (ctx) => {
          return (
            prefix +
            (_.get(ctx, "session.uid") || ctx.get("x-real-ip") || ctx.ip)
          );
        },
        handler: () => {
          throw new ErrorMessage(RateLimitResponse.description, 429);
        },
      });
      RateLimiter.prefixMap.set(prefix, limiterMiddleware);
    }
    return RateLimiter.prefixMap.get(prefix);
  }

  @Middleware()
  @Responses(RateLimitResponse)
  static async Attach(
    @Ctx() ctx: Context,
    @This() rateLimiter: RateLimiter,
    @Cursor() cursor: ICursor,
    { next } // возьмем оригинальную next-функцию для koa
  ) {
    const { prefix } = cursor;
    const middleware = rateLimiter.getMapMiddleware(
      prefix,
      <RateLimitedRoute>cursor.origin.constructor
    );
    return middleware(ctx, next);
  }
}
