import { controllers } from "models";
import { UseNext, RequestBody, AddTag, UseTag } from "aom";
import { Responses, Summary, Bridge, Controller, MergeNextTags } from "aom";
import { Post, NextFunction, Get, Middleware, Next, This, Use } from "aom";
import { MessageResponse, WrongDataResponse } from "common/api";
import { SafeBody } from "common/decorators";
import { AccessAdmin, QueryStringData, Renders } from "common/controllers";

import { User } from "./user";
import { UserLogins } from "./logins";

import { UserDTO, UserLoginCheckDTO, UsersFilter, UserID } from "./init";

@AddTag("Пользователи")
@Use(AccessAdmin.Required, Users.Tag)
@Bridge(`/user_${UserID}`, User)
@Controller()
export class Users extends controllers.Users.data() {
  @Get()
  @Summary("Список пользователей")
  @Use(UsersFilter.Search)
  @Use(QueryStringData.StandartSearch)
  @UseNext(Users.TotalData)
  static async Index(
    @This() users: Users,
    @Next() next: NextFunction
  ): Promise<ReturnType<NextFunction>> {
    await users.getData();
    return next();
  }

  @Post()
  @Summary("Добавить пользователя")
  @RequestBody({ schema: UserDTO })
  @Responses(WrongDataResponse.toJSON())
  @UseNext(User.Index)
  static async Add(
    @SafeBody(UserDTO) body: UserDTO,
    @This() user: UserID,
    @Next() next: NextFunction
  ) {
    user.document = await user.model.create({ ...body });
    return next();
  }

  @Middleware()
  @UseTag(Users)
  @MergeNextTags()
  static Tag(
    @Next() next: NextFunction
  ): ErrorResponse<ReturnType<NextFunction>> {
    return next();
  }

  @Post("/check-logins")
  @Summary("Проверить валидность логина")
  @RequestBody({
    description: "Данные логина",
    schema: UserLoginCheckDTO,
  })
  @Responses(MessageResponse.toJSON("Логин корректен"))
  @Use(UserLogins.CheckLogin)
  static async checkLogins(): Promise<ErrorResponse<MessageResponse>> {
    return new MessageResponse("Логин корректен");
  }
}
