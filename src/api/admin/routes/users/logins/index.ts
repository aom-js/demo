import { DocumentType } from "@typegoose/typegoose";
import { Controller, Bridge, AddTag, Middleware } from "aom";
import { Next, NextFunction, Use, UseTag } from "aom";
import * as schemas from "schemas";
import { AccessAdmin, LoginsListBase } from "common/controllers";
// eslint-disable-next-line import/no-cycle
import { UserLogin } from "./login";
// eslint-disable-next-line import/no-cycle

import { UserID } from "../init";

@Controller()
@Bridge(`/login_${UserLogin}`, UserLogin)
@AddTag("Управление логинами")
@Use(AccessAdmin.Required, UserLogins.Init)
export class UserLogins extends LoginsListBase {
  static accountId: "userId" = "userId";

  static accountLoginId: "userLoginId" = "userLoginId";

  static loginsSchema = schemas.UsersLogins;

  validLogin: schemas.UsersLogins;

  account: DocumentType<schemas.Users>;

  static accountStateInfo(
    stateMap: WeakMap<any, any>
  ): DocumentType<schemas.Users> {
    const userRouteState = <UserID>stateMap.get(UserID);
    return userRouteState.document;
  }

  @Middleware()
  @UseTag(UserLogins)
  static Init(@Next() next: NextFunction): ReturnType<NextFunction> {
    return next();
  }
}
