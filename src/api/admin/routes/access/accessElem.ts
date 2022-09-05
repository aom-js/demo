import { controllers } from "models";
import { WrongDataResponse } from "common/api";
import { SafeBody } from "common/decorators";

import { Endpoint, Get, Patch, Put, RequestBody, Summary, UseNext } from "aom";
import { This, Next, NextFunction, Use, Controller, Responses } from "aom";

import { AccessDTO, AccessPartialDTO } from "./init";

@Controller()
@Use(AccessElem.PathID)
export class AccessElem extends controllers.Access.document("accessId") {
  @Get()
  @Endpoint()
  @Summary("Информация о роли")
  @Responses(AccessElem.toJSON("Информация о роли"))
  static Index(@This() self: AccessElem) {
    return self.document;
  }

  @Put()
  @Summary("Обновить данные о роли")
  @RequestBody({
    schema: AccessDTO,
  })
  @Responses(WrongDataResponse.toJSON())
  @UseNext(AccessElem.Index)
  static async Update(
    @SafeBody(AccessDTO) body: AccessDTO,
    @This() elem: AccessElem,
    @Next() next: NextFunction
  ): Promise<ReturnType<NextFunction>> {
    Object.assign(elem, { body });
    return next(this.SaveBody, this.Define);
  }

  @Patch()
  @Summary("Обновить данные о роли (частично)")
  @RequestBody({
    schema: AccessPartialDTO,
  })
  @Responses(WrongDataResponse.toJSON())
  @UseNext(AccessElem.Index)
  static async Patch(
    @SafeBody(AccessPartialDTO) body: AccessPartialDTO,
    @This() elem: AccessElem,
    @Next() next: NextFunction
  ): Promise<ReturnType<NextFunction>> {
    Object.assign(elem, { body });
    return next(this.SaveBody, this.Define);
  }
}
