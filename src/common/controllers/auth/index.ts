import _ from "lodash";
import { Next, Use } from "aom";
import { Headers, NextFunction, Responses, This, UseSecurity } from "aom";
import { AddSecurity, Controller, Err, ErrorFunction, Middleware } from "aom";

import { AuthRequiredResponse, ErrorMessage } from "common/api";
import { TokenTypes } from "common/types";

import {
  AUTH_NO_TOKEN,
  AUTH_TOKEN_EXPIRED,
  AUTH_WRONG_TOKEN,
  AUTH_WRONG_TOKEN_TYPE,
} from "common/constants";

import { AuthBase } from "./base";

export const BearerSecuritySchema = {
  type: "http",
  scheme: "bearer",
};

@Controller()
@AddSecurity(BearerSecuritySchema)
export class Auth extends AuthBase {
  // permissions: DocumentType<UsersPermissions>;

  @Middleware()
  @Responses(AuthRequiredResponse.toJSON())
  @UseSecurity(Auth)
  // @Use(Logger.Attach)
  static async Required(
    @Headers("authorization") authToken: string,
    @Headers("sec-websocket-protocol") socketProtocol: string,
    @This() auth: Auth,
    @Next() next: NextFunction,
    @Err(ErrorMessage) err: ErrorFunction
  ): Promise<ErrorResponse<ReturnType<NextFunction>>> {
    if (!authToken && !socketProtocol) return err(AUTH_NO_TOKEN, 401);
    const [tokenType, tokenValue] = (
      _.replace(socketProtocol, "_", " ") || authToken
    ).split(" ");
    if (!(tokenType in TokenTypes)) return err(AUTH_WRONG_TOKEN_TYPE, 401);

    const tokensModel = this.tokensSchema.getModel();
    const existsToken = await tokensModel.findOne({
      type: TokenTypes[tokenType],
      accessToken: tokenValue,
      enabled: true, // найдем только активный токен
    });
    // если токен не найден
    if (!existsToken) return err(AUTH_WRONG_TOKEN, 401);
    // если токен "протух"
    if (existsToken.expiredAt && existsToken.expiredAt > new Date()) {
      return err(AUTH_TOKEN_EXPIRED, 401);
    }
    auth.token = existsToken;
    const { accountId, accountLoginId } = this;

    const loginsModel = this.loginsSchema.getModel();
    const accountModel = this.accountSchema.getModel();
    // const permissionsModel = UsersPermissions.getModel();
    // сохраним информацию о логине для данного токена
    auth.login = await loginsModel.findById(existsToken[accountLoginId]);
    // сохраним информацию об аккаунте
    auth.account = await accountModel.findById(auth.login[accountId]);
    // найдем и установим разрешения
    /*
    auth.permissions = await permissionsModel.findOne({
      [accountId]: auth.login[accountId],
    });
    */
    return next();
  }
}

export { AuthBase };
