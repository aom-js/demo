import _ from "lodash";
import { QueryParameters } from "aom";
import { RouteRef, Responses, Query, Controller, Use } from "aom";
import { Middleware, This, Next, NextFunction, Err, ErrorFunction } from "aom";
import { BaseModel } from "common/schemas";
import { IdFilter, PagerFilter, ErrorMessage } from "common/api";
import { SafeQuery } from "common/decorators";
import { WRONG_ROUTE_EXTENDS } from "common/constants";
import { DataRoute } from "./data-route";

@Controller()
export class QueryStringData {
  @Middleware()
  @QueryParameters(...IdFilter.toJSON())
  static async SearchById<T extends DataRoute<typeof BaseModel>>(
    @SafeQuery(IdFilter) idFilter: IdFilter,
    @This(RouteRef()) route: T,
    @Next() next: NextFunction
  ): Promise<ReturnType<NextFunction>> {
    const { _id = {} } = route.where;

    if (idFilter._id) {
      Object.assign(_id, { $in: idFilter._id });
    }
    if (idFilter.skip_id) {
      Object.assign(_id, { $nin: idFilter.skip_id });
    }
    if (Object.values(_id).length) {
      Object.assign(route.where, { _id });
    }
    return next();
  }

  @Middleware()
  @QueryParameters(...PagerFilter.toJSON())
  static async Pager<T extends DataRoute<typeof BaseModel>>(
    @This(RouteRef()) route: T,
    @SafeQuery(PagerFilter) pager: PagerFilter,
    @Next() next: NextFunction
  ): Promise<ReturnType<NextFunction>> {
    route.pager = pager;
    return next();
  }

  @Middleware()
  @QueryParameters({
    name: "populates",
    schema: RouteRef(({ schema }) => {
      const { virtuals } = schema.getModel().schema;
      const allowedPopulates = Object.keys(virtuals);
      if (allowedPopulates.length) {
        return {
          type: "array",
          items: {
            type: "string",
            enum: Object.keys(virtuals),
          },
        };
      } else {
        return null;
      }
    }),
  })
  static Populates<T extends DataRoute<typeof BaseModel>>(
    @This(RouteRef()) route: T,
    @Query() { populates }: CustomData,
    @Next() next: NextFunction
  ): ReturnType<NextFunction> {
    populates = _.split(populates, ",");
    const { virtuals } = route.model.schema;
    populates.forEach((populate) => {
      if (Reflect.get(virtuals, populate)) {
        route.populates.add(populate);
      }
    });
    return next();
  }

  @Middleware()
  @Use(QueryStringData.CheckRoute)
  @Use(
    QueryStringData.Pager,
    QueryStringData.Populates,
    QueryStringData.SearchById
  )
  static async StandartSearch(
    @Next() next: NextFunction
  ): Promise<ReturnType<NextFunction>> {
    return next();
  }

  @Middleware()
  @Responses(ErrorMessage.toJSON(WRONG_ROUTE_EXTENDS))
  static CheckRoute<T extends DataRoute<typeof BaseModel>>(
    @This(RouteRef()) route: T,
    @Err(ErrorMessage) err: ErrorFunction,
    @Next() next: NextFunction
  ): ErrorResponse<ReturnType<NextFunction>> {
    if (route instanceof DataRoute) {
      return next();
    }
    return err(WRONG_ROUTE_EXTENDS);
  }
}
