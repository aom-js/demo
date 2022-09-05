import { DocumentType } from "@typegoose/typegoose";
import { Controller, Next, Use, Middleware, Body } from "aom";
import { Err, ErrorFunction, NextFunction, Query, Responses } from "aom";
import { StateMap, This, ThisRef } from "aom";
import { ErrorMessage } from "common/api";
import { SafeData } from "common/decorators";

import {
  AccountId,
  AccountLoginId,
  LoginsSchemaType,
  LoginType,
  AccountType,
} from "./types";

const ValidBody = ThisRef(
  <T extends typeof LoginsInitBase>({ loginsSchema }: T) =>
    SafeData(loginsSchema)
);

@Controller()
@Use(LoginsInitBase.Prepare)
export class LoginsInitBase {
  static accountLoginId: AccountLoginId;

  static accountId: AccountId;

  static loginsSchema: LoginsSchemaType;

  account: DocumentType<AccountType>;

  login: DocumentType<LoginType>;

  validLogin: LoginType;

  static accountStateInfo(stateMap: WeakMap<any, any>): any {
    const routeState = <LoginsInitBase>stateMap.get(this);
    return routeState.account;
  }

  @Middleware()
  static Prepare(
    @This() loginsInit: LoginsInitBase,
    @StateMap() stateMap: WeakMap<any, any>,
    @Next() next: NextFunction
  ): ReturnType<NextFunction> {
    loginsInit.account = this.accountStateInfo(stateMap);
    return next();
  }

  @Middleware()
  @Responses({
    status: 400,
    description: "Ошибка проверки логина",
    schema: ErrorMessage,
  })
  static async CheckLogin(
    @Query() { _id }: CustomData,
    @This() loginsInit: LoginsInitBase,
    @Body(ValidBody) login: LoginType,
    @Err(ErrorMessage) err: ErrorFunction,
    @Next() next: NextFunction
  ): Promise<ErrorResponse<ReturnType<NextFunction>>> {
    const loginsModel = this.loginsSchema.getModel();
    // ..
    // получим корректное значение логина
    const validValue = loginsModel.validateValue(login);
    if (validValue) {
      // убедимся, что логина с таким значением не существует
      const existsLogin = await loginsModel.findOne({
        value: validValue,
        type: login.type,
      });
      _id = loginsInit.login ? loginsInit.login._id : _id;
      if (
        (existsLogin && !_id) ||
        (existsLogin && _id.toString() !== existsLogin._id.toString())
      ) {
        return err("Логин занят", 400);
      }
    } else {
      return err("Некорректный логин", 400);
    }
    // сохраним в контексте валидное значение логина, которое потом сможем использовать
    loginsInit.validLogin = Object.assign(login, { value: validValue });

    return next();
  }
}
