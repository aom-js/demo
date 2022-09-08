import { Bridge, Controller, Get, Responses, Summary, This, Use } from "aom";
import { CommonResponse } from "common/api";

import { Items } from "./items";
import { Publications } from "./publications";

@Controller()
@Bridge("/items", Items)
@Bridge("/publications", Publications)
export class Routes extends CommonResponse {
  @Get()
  @Summary("Проверка API")
  @Responses(Routes.toJSON())
  static async Index(@This() self: Routes) {
    return self;
  }
}

export default Routes;
