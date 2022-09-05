import { Controller, Endpoint } from "aom";
import { Responses, RouteRef, This } from "aom";
import { TotalDataResponse } from "common/api";
import { BaseModel } from "common/schemas";
import { DataRoute } from "./data-route";

const responseSchema = (schema, attr = "data") =>
  RouteRef(<T extends typeof DataRoute>(route: T) =>
    route.combineSchemas(schema, attr)
  );

@Controller()
export class Renders {
  // ...
  @Endpoint()
  @Responses({
    status: 200,
    description: "Структура со сводной информацией",
    schema: responseSchema(TotalDataResponse),
  })
  static async TotalData<T extends DataRoute<typeof BaseModel>>(
    @This(RouteRef()) route: T
  ): Promise<TotalDataResponse> {
    const { where, data, model } = route;
    const result = new TotalDataResponse();
    result.data = data;
    result.total = await model.countDocuments(where);
    return result;
  }
}
