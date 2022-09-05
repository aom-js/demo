import { C } from "ts-toolbelt";
import { Body, Next, RequestBody, Use } from "aom";
import { Controller, DelayRefStack } from "aom";
import { Middleware, NextFunction, Responses } from "aom";
import { RouteRef, ThisRef, This } from "aom";
import { BaseModel } from "common/schemas";
import { SafeData } from "common/decorators/safe-data";
import { WrongDataResponse } from "common/api";
import { OpenApiRequestBody } from "aom/lib/openapi/types";

import { DocumentRoute } from "./document-route";

const SafeOrigin = ThisRef(
  <T extends typeof BodyBuilderConstructor>({ schema }: T) => SafeData(schema)
);
const SafeOriginRequestBody = ThisRef(
  <T extends typeof BodyBuilderConstructor>(constructor: T) => [
    RequestBody(constructor.toJSON()),
  ]
);
@Controller()
export class BodyBuilderConstructor<
  T extends C.Class<any, any>,
  R = C.Instance<T>
> {
  static schema;

  static description?;

  body: R;

  static toJSON(description?: string): OpenApiRequestBody {
    return {
      schema: this.schema,
      description: description || this.description,
    };
  }

  @Middleware()
  @Use(BodyBuilderConstructor.Body)
  static async Attach<T extends DocumentRoute<typeof BaseModel>>(
    @This() self: BodyBuilderConstructor<typeof BaseModel>,
    @This(RouteRef()) route: T,
    @Next() next: NextFunction
  ) {
    route.body = self.body;
    return next();
  }

  @Middleware()
  @DelayRefStack(SafeOriginRequestBody)
  @Responses(WrongDataResponse.toJSON())
  static async Body(
    @Body(SafeOrigin) body,
    @This() self: BodyBuilderConstructor<typeof BaseModel>,
    @Next() next: NextFunction
  ) {
    self.body = body;
    return next();
  }
}

export function BodyBuilder<T extends C.Class<any, any>>(
  schema: T,
  description?: string
) {
  return class extends BodyBuilderConstructor<T> {
    static schema = schema;

    static description = description;
  };
}
