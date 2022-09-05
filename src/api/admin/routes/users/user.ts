import { Next, Put, Controller, Get, Patch, UseNext } from "aom";
import { This, Use, Endpoint, Bridge, NextFunction } from "aom";
import { RequestBody, Responses, Summary } from "aom";
import { WrongDataResponse } from "common/api";
import { SafeBody } from "common/decorators";

import { UserLogins } from "./logins";
import { UserPermissions } from "./user_permissions";
import { UserDTO, UserPartialDTO, documentDataType, UserID } from "./init";

@Controller()
@Bridge("/logins", UserLogins)
@Bridge("/permissions", UserPermissions)
@Use(UserID.PathID)
export class User {
  @Endpoint()
  @Get()
  @Summary("Информация о пользователе")
  @Responses(UserID.toJSON("Информация о пользователе"))
  static Index(@This() { document }: UserID): documentDataType {
    return document;
  }

  @Endpoint()
  @Put()
  @Summary("Обновить информацию о пользователе")
  @RequestBody({
    description: "Данные пользователя",
    schema: UserDTO,
  })
  @Responses(WrongDataResponse.toJSON())
  @UseNext(User.Index)
  static async Update(
    @SafeBody(UserDTO) body: UserDTO,
    @This() user: UserID,
    @Next() next: NextFunction
  ): Promise<ErrorResponse<ReturnType<NextFunction>>> {
    Object.assign(user, { body });
    return next(UserID.SaveBody, UserID.Define);
  }

  @Patch()
  @Summary("Обновить информацию (частично)")
  @RequestBody({
    description: "Данные пользователя",
    schema: UserPartialDTO,
  })
  @Responses(WrongDataResponse.toJSON())
  @UseNext(User.Index)
  static async Patch(
    @SafeBody(UserPartialDTO) body: UserPartialDTO,
    @This() user: UserID,
    @Next() next: NextFunction
  ): Promise<ErrorResponse<ReturnType<NextFunction>>> {
    Object.assign(user, { body });
    return next(UserID.SaveBody, UserID.Define);
  }
}
