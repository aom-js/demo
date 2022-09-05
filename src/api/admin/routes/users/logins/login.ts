import { DocumentType } from "@typegoose/typegoose";
import { Controller } from "aom";
import { schemas } from "models";
import { LoginInfoBase } from "common/controllers";

import { UserID } from "../init";

@Controller()
export class UserLogin extends LoginInfoBase {
  static accountId: "userId" = "userId";

  static accountLoginId: "userLoginId" = "userLoginId";

  static loginsSchema = schemas.UsersLogins;

  static authSchema = schemas.UsersLoginsAuthorizations;

  validLogin: schemas.UsersLogins;

  account: DocumentType<schemas.Users>;

  static accountStateInfo(
    stateMap: WeakMap<any, any>
  ): DocumentType<schemas.Users> {
    const userRouteState = <UserID>stateMap.get(UserID);
    return userRouteState.document;
  }
}
