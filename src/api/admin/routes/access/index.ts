import { controllers } from "models";
import { AccessAdmin, QueryStringData, Renders } from "common/controllers";
import { Bridge, NextFunction, Post, Summary, UseNext } from "aom";
import { This, Middleware, UseTag, AddTag, Controller, Use } from "aom";
import { RequestBody, Responses, Get, Next } from "aom";
import { WrongDataResponse } from "common/api";
import { SafeBody } from "common/decorators";
import { AccessElem } from "./accessElem";
import { AccessDTO } from "./init";

@AddTag("Роли доступа")
@Controller()
@Use(AccessAdmin.Required, Access.Init)
@Bridge(`/id_${AccessElem}`, AccessElem)
export class Access extends controllers.Access.data() {
  @Middleware()
  @UseTag(Access)
  static Init(@Next() next: NextFunction): ReturnType<NextFunction> {
    return next();
  }

  @Get()
  @Summary("Список ролей")
  @UseNext(Access.TotalData)
  @Use(QueryStringData.StandartSearch)
  static async Index(
    @This() access: Access,
    @Next() next: NextFunction
  ): Promise<ReturnType<NextFunction>> {
    await access.getData();
    return next();
  }

  @Post()
  @Summary("Создать новую роль")
  @RequestBody({ schema: AccessDTO })
  @Responses(WrongDataResponse.toJSON())
  @UseNext(AccessElem.Index)
  static async Add(
    @This() access: AccessElem,
    @SafeBody(AccessDTO) body: AccessDTO,
    @Next() next: NextFunction
  ): Promise<ReturnType<NextFunction>> {
    access.document = await access.model.create({ ...body });
    return next();
  }
}
