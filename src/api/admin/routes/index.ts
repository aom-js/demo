import { Bridge, Controller, Get, Responses, Summary, This, Use } from "aom";
import { CommonResponse } from "common/api";
import { AccessAdmin, Account, Auth } from "common/controllers";

import { Access } from "./access";
import { Users } from "./users";
import { Items } from "./items";
import { References } from "./references";
import { Publications } from "./publications";

@Controller()
@Bridge("/access", Access)
@Bridge("/users", Users)
@Bridge("/items", Items)
@Bridge("/references", References)
@Bridge("/publications", Publications)
@Use(Auth.Required, Account.Init, AccessAdmin.Init, AccessAdmin.Required)
export class Routes extends CommonResponse {
  @Get()
  @Summary("Проверка API")
  @Responses(Routes.toJSON())
  static async Index(@This() self: Routes) {
    return self;
  }
}

export default Routes;
