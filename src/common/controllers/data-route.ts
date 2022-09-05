import { C } from "ts-toolbelt";
import { RouteRef, CombineSchemas, Controller } from "aom";
import { OpenApiResponse, Responses, Endpoint, This } from "aom";
import { DocumentType, ReturnModelType } from "@typegoose/typegoose";
import { getModelForClass } from "@typegoose/typegoose";
import { FilterQuery, PopulateOptions } from "mongoose";
import { BaseModel } from "common/schemas/base";
import { PagerFilter, DataResponse, TotalDataResponse } from "common/api";

const combineResponseSchema = (schema, attr = "data") =>
  RouteRef(<T extends typeof DataRoute>(route: T) =>
    route.combineSchemas(schema, attr)
  );

@Controller()
export abstract class DataRoute<T extends typeof BaseModel, U = C.Instance<T>> {
  static schema;

  model!: ReturnModelType<T>;

  data: DocumentType<U>[] = [];

  where: FilterQuery<U> = {}; // поддерживает стандартный запрос к базе

  sortOrder: { [K in keyof U]?: 1 | -1 }; // сортировать по ключам в одном из направлений

  pager: PagerFilter; // используется схема `?offset=number&limit=number`

  populates: Set<string | PopulateOptions> = new Set();

  response: TotalDataResponse = new TotalDataResponse();

  static combineSchemas(schema, attr) {
    return CombineSchemas(schema, { [attr]: [this.schema] });
  }

  static _responseSchema() {
    return CombineSchemas(TotalDataResponse, { data: [this.schema] });
  }

  /** стандартное извлечение данных на основании используемых ограничений */
  async getData(): Promise<void> {
    const query = this.model.find(this.where);
    // добавим постраничную навигацию
    if (this.pager) {
      const { offset, limit } = this.pager;
      query.skip(offset).limit(limit);
    }
    // добавим сортировку
    if (this.sortOrder) {
      query.sort(this.sortOrder);
    }
    // раскроем populate конструкции
    this.populates.forEach((populate) => query.populate(populate as any));
    // извлечем данные без преобразования в документы
    this.data = await query.lean();
  }

  /* JSON-значение данного класса - это схема успешного ответа, которое принимает `@Responses()` 
    интерпретирует ответ в зависимости от указания того, список это или 
  */
  static toJSON(
    description: string | string[] = "типовая структура данных по схеме"
  ): OpenApiResponse {
    return {
      status: 200,
      schema: this.schema,
      isArray: Array.isArray(description),
      description: description ? description.toString() : null,
    };
  }

  // ...
  @Endpoint()
  @Responses({
    status: 200,
    description: "Структура со сводной информацией",
    schema: combineResponseSchema(TotalDataResponse),
  })
  static async TotalData<T extends DataRoute<typeof BaseModel>>(
    @This() route: T
  ): Promise<TotalDataResponse> {
    const { where, data, model, response } = route;
    response.data = data;
    response.total = await model.countDocuments(where);
    return response;
  }
}

/**
 * Фабрика роутера: позволяет передать на вход схему, и вернуть класс с созданной моделью.
 */

export function CreateDataRoute<T extends typeof BaseModel>(schema: T) {
  return class extends DataRoute<T> {
    static schema = schema;

    model = getModelForClass(schema);
  };

  /*
 export function CreateDataRoute<T extends typeof BaseModel, U extends typeof DataRoute<T, C.Instance<T>>>(schema: T): U {
  return class extends DataRoute<T> {
    static schema = schema;

    model = getModelForClass(schema);
  } as unknown as U;
  */
}

export default CreateDataRoute;
