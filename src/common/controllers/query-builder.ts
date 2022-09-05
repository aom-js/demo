import { C } from "ts-toolbelt";
import { FilterQuery } from "mongoose";
import { Ctx, Next, Use } from "aom";
import { Controller, DelayRefStack, Err, ErrorFunction } from "aom";
import { Middleware, NextFunction, QueryParameters, Responses } from "aom";
import { REQUIRED_DATA_MISSING } from "common/constants";
import { Query, RouteRef, ThisRef, This, toJSONSchema } from "aom";
import { KoaContext } from "aom/lib/common/declares";
import { ErrorMessage, WrongDataResponse } from "common/api";
import { SafeData } from "common/decorators";
import { QueryFilter } from "common/api";
import { BaseModel } from "common/schemas";
//
import { DataRoute } from "./data-route";
//
const SafeOrigin = ThisRef(
  <T extends typeof QueryBuilderConstructor>({ origin }: T) => SafeData(origin)
);
const SafeOriginParameters = ThisRef(
  <T extends typeof QueryBuilderConstructor>(constructor: T) => [
    QueryParameters(...constructor.toJSON()),
  ]
);
//
@Controller()
export class QueryBuilderConstructor<
  T extends typeof QueryFilter,
  R = C.Instance<T>
> extends QueryFilter {
  static origin;

  async queryBuild(query: R): Promise<FilterQuery<R>> {
    return { ...query } as unknown as FilterQuery<R>;
  }

  static generateJSONSchema() {
    return toJSONSchema(this.origin);
  }

  ctx: KoaContext;

  @Middleware()
  static async AttachContext(
    @Ctx() ctx: KoaContext,
    @This() self: QueryBuilderConstructor<typeof QueryFilter>,
    @Next() next: NextFunction
  ) {
    self.ctx = ctx;
    return next();
  }

  @Middleware()
  @Responses(WrongDataResponse.toJSON())
  static async NotEmpty(
    @Query(SafeOrigin) query: CustomData,
    @Err(ErrorMessage) err: ErrorFunction,
    @Next() next: NextFunction
  ) {
    if (!Object.entries(query).length) {
      return err(REQUIRED_DATA_MISSING, 400);
    }
    return next();
  }

  @Middleware()
  @DelayRefStack(SafeOriginParameters)
  @Responses(WrongDataResponse.toJSON())
  @Use(QueryBuilderConstructor.AttachContext)
  static async Search<T extends DataRoute<typeof BaseModel>>(
    @Query(SafeOrigin) query: CustomData,
    @This() self: QueryBuilderConstructor<typeof QueryFilter>,
    @This(RouteRef()) route: T,
    @Next() next: NextFunction
  ) {
    const where = await self.queryBuild(query);
    Object.assign(route.where, { ...where });
    return next();
  }
}
//
export function QueryBuilder<T extends typeof QueryFilter>(origin: T) {
  return class extends QueryBuilderConstructor<T> {
    static origin = origin;
  };
}
