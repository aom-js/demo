/**
 * Данный класс создает контроллер `DocumentRoute`, который может быть унаследован другими контроллерами
 * и позволяет быстро и безопасно извлечь значение из модели данных по его `_id`.
 * В общем случае данный контроллер обеспечивает возможность быстро включить в контекст документ,
 * который был найден по `_id`, а также обеспечить быстрое сохранение промежуточно накопленных данных.
 *
 */
import { C } from "ts-toolbelt";
import {
  DocumentType,
  getModelForClass,
  ReturnModelType,
} from "@typegoose/typegoose";
import { BaseModel } from "common/schemas/base";
import { Query, QueryParameters, RouteRef } from "aom";
import { Next, ErrorFunction, Err, Responses } from "aom";
import { NextFunction, Params, Controller, Middleware } from "aom";
import { PathParameters, DelayRefStack, This, ThisRef, Use } from "aom";
import { NotFoundResponse, MongoID } from "common/api";
import { Types } from "mongoose";
import {
  OpenApiPathParameters,
  OpenApiResponse,
  OpenApiPathParameterObject,
} from "aom/lib/openapi/types";
import { ERROR_ID, ERROR_NOT_FOUND } from "common/constants";

const PathRefParams = ThisRef(
  <T extends typeof DocumentRoute>(constructor: T) => {
    return [PathParameters(constructor.param())];
  }
);

const QueryRefParams = ThisRef(
  <T extends typeof DocumentRoute>(constructor: T) => [
    QueryParameters(constructor.apiPath("query")),
  ]
);

@Controller()
// @Use(DocumentRoute.PathPrepare, DocumentRoute.Define)
export class DocumentRoute<T extends typeof BaseModel, U = C.Instance<T>> {
  static schema;

  static tagName: string;

  static paramId: string;

  notFoundMessage = ERROR_NOT_FOUND;

  _id: Types.ObjectId;

  model!: ReturnModelType<T>;

  document: DocumentType<U>;

  data: U;

  body: Partial<U> = {};

  static async parseValuesId(values): Promise<Types.ObjectId> {
    return new Types.ObjectId(values[this.paramId]);
  }

  @Middleware()
  @Responses(NotFoundResponse.toJSON(ERROR_ID))
  static async PathPrepare(
    @This() elem: DocumentRoute<typeof BaseModel>,
    @Params() params: any,
    @Err(NotFoundResponse) err: ErrorFunction,
    @Next() next: NextFunction
  ): Promise<ErrorResponse<ReturnType<NextFunction>>> {
    try {
      elem._id = await this.parseValuesId(params);
      return next();
    } catch (e) {
      return err(ERROR_ID);
    }
  }

  @Middleware()
  @Responses(NotFoundResponse.toJSON(ERROR_ID))
  static async QueryPrepare(
    @This() elem: DocumentRoute<typeof BaseModel>,
    @Query() params: any,
    @Err(NotFoundResponse) err: ErrorFunction,
    @Next() next: NextFunction
  ): Promise<ErrorResponse<ReturnType<NextFunction>>> {
    try {
      elem._id = await this.parseValuesId(params);
      return next();
    } catch (e) {
      return err(ERROR_ID);
    }
  }

  @Middleware()
  @Responses(NotFoundResponse.toJSON())
  static async Define(
    @This() self: DocumentRoute<typeof BaseModel>,
    @Err(NotFoundResponse) err: ErrorFunction,
    @Next() next: NextFunction
  ) {
    self.document = await self.model.findById(self._id);
    if (!self.document) {
      return err(self.notFoundMessage);
    }
    return next();
  }

  @Middleware()
  static async SaveBody(
    @This() elem: DocumentRoute<typeof BaseModel>,
    @Next() next: NextFunction
  ) {
    await elem.model.updateOne({ _id: elem._id }, { $set: { ...elem.body } });
    return next();
  }

  @Middleware()
  @DelayRefStack(PathRefParams)
  @Responses(NotFoundResponse.toJSON())
  static async PathID(@Next() next: NextFunction) {
    return next(this.PathPrepare, this.Define);
  }

  @Middleware()
  @DelayRefStack(QueryRefParams)
  @Responses(NotFoundResponse.toJSON())
  static async QueryID(@Next() next: NextFunction) {
    return next(this.PathPrepare, this.Define);
  }

  static toString(): string {
    return MongoID.param(this.paramId);
  }

  static param(): OpenApiPathParameters {
    return {
      [this.toString()]: this.apiPath("path"),
    };
  }

  static apiPath(idIn: "path" | "query"): OpenApiPathParameterObject {
    return {
      name: this.paramId,
      description: this.paramId,
      schema: MongoID.schema,
      in: idIn,
    };
  }

  /* JSON-значение данного класса - это схема успешного ответа, которое принимает `@Responses()`
     интерпретирует ответ в зависимости от указания того, список это или
   */
  static toJSON(description = "документ данных"): OpenApiResponse {
    return {
      status: 200,
      schema: this.schema,
      description,
    };
  }
}

/**
 * Фабрика возвращает класс с установленными значениями схемы и созданной моделью данных.
 */

export function CreateDocumentRoute<T extends typeof BaseModel>(
  schema: T,
  paramId?: string
) {
  return class extends DocumentRoute<T> {
    static schema = schema;

    static paramId = paramId;

    model = getModelForClass(schema);
  };
}
