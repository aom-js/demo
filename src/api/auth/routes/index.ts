import _ from "lodash";
import models from "models";
import { isEmail } from "class-validator";
import {
  AUTH_LOGIN_DISABLED,
  AUTH_LOGIN_WRONG_CONFIRM_CODE,
  AUTH_LOGIN_WRONG_PASSWORD,
  LOGIN_NOT_FOUND,
  LOGIN_WRONG,
} from "common/constants";
import moment from "moment";

import {
  Post,
  Use,
  UseNext,
  Body,
  Err,
  Middleware,
  This,
  Controller,
} from "aom";
import { Endpoint, NextFunction, ErrorFunction, ThisRef } from "aom";
import { Next } from "aom";
import { LoginTypes } from "common/types";
import { Description, RequestBody, Responses, Summary } from "aom";
import { AddTag, UseTag } from "aom";
import { ConflictResponse } from "common/api";
import { SafeBody } from "common/decorators";
import { WrongDataResponse, ErrorMessage, MessageResponse } from "common/api";
import { AuthBase, Login, Token } from "common/controllers/auth/base";
import { RateLimiter } from "common/controllers";
import Pusher from "kafka/pusher";
import {
  AuthForm,
  RequestCodeForm,
  ConfirmCodeForm,
  RequestCodeResponse,
} from "./init";

const LoginTokenSchema = ThisRef(
  <T extends typeof LoginRoute>(auth: T) => auth.tokensSchema
);

@AddTag("Авторизация")
@Controller()
export class LoginRoute extends AuthBase {
  // максимум 30 запросов в минуту, c паузой после 10-го в 2 секунды
  static rateLimiter = new RateLimiter({
    safeRequests: 10,
    maxRequests: 30,
    inSeconds: 60,
    waitSeconds: 2,
  });

  @Post("/login")
  @Summary("Стандартная авторизация")
  @Description("Ожидает логин/пароль, возвращает токен")
  @RequestBody({
    description: "Авторизационные данные: логин, пароль",
    schema: AuthForm,
  })
  @UseTag(LoginRoute)
  @Responses({
    status: 400,
    schema: ErrorMessage,
    description: "Ошибка авторизации",
  })
  @UseNext(LoginRoute.Token)
  static async Login(
    @This() auth: LoginRoute,
    @Body() body: AuthForm,
    @Err(ErrorMessage) err: ErrorFunction,
    @Next() next: NextFunction
  ): Promise<ErrorResponse<ReturnType<NextFunction>>> {
    const { login, password } = body;
    const loginsModel = this.loginsSchema.getModel();
    const { accountLoginId } = this;
    const existsLogin = await loginsModel.findOne({
      value: login,
      type: LoginTypes.PLAIN,
      enabled: true,
    });
    if (!existsLogin) return err(LOGIN_NOT_FOUND, 400);

    const authModel = this.authSchema.getModel();
    const loginAuth = await authModel.findOne({
      [accountLoginId]: existsLogin._id,
      enabled: true,
    });
    if (!loginAuth) return err(AUTH_LOGIN_DISABLED, 400);

    const validAuth = loginAuth.checkPassword(password);
    if (!validAuth) return err(AUTH_LOGIN_WRONG_PASSWORD, 400);

    auth.login = existsLogin;
    return next();
  }

  @Middleware()
  @UseTag(LoginRoute)
  @Responses(WrongDataResponse.toJSON())
  static async CheckLogin(
    @This() auth: LoginRoute,
    @SafeBody(RequestCodeForm) { login }: RequestCodeForm,
    @Err(ErrorMessage) err: ErrorFunction,
    @Next() next: NextFunction
  ): Promise<ErrorResponse<ReturnType<NextFunction>>> {
    const loginsModel = this.loginsSchema.getModel();
    // определим тип логина на основании регулярки
    const type = isEmail(login) ? LoginTypes.EMAIL : LoginTypes.PHONE;
    const validValue = loginsModel.validateValue(<Login>{ value: login, type });
    if (!validValue) return err(LOGIN_WRONG, 400);

    auth.login = await loginsModel
      .findOne({ value: validValue, type, enabled: true })
      .lean();
    if (!auth.login) return err(LOGIN_NOT_FOUND, 400);
    // извлечем права доступа
    const { userId } = auth.login;

    return next();
  }

  @Post("/request")
  @Summary("Запросить авторизацию по телефону")
  @RequestBody({ schema: RequestCodeForm })
  @Responses(
    ConflictResponse.toJSON(),
    RequestCodeResponse.toJSON("Код отправлен")
  )
  @Use(RateLimiter.Attach, LoginRoute.CheckLogin)
  static async RequestCode(
    @This() { login, permissions }: LoginRoute,
    @Err(ConflictResponse) err: ErrorFunction
  ): Promise<ErrorResponse<RequestCodeResponse>> {
    // ..
    const { accountLoginId } = this;
    const loginId = login._id;
    // сгенерируем 6-ти значный авторизационный код
    const confirmCode = _.random(100001, 999999);

    // активный одноразовый пароль
    const activeOneoffAuth = {
      [accountLoginId]: loginId,
      oneOff: true,
      enabled: true,
    };
    const authModel = this.authSchema.getModel();

    // не чаще 1 смс в минуту
    const existsOneoffAuth = await authModel.findOne({
      ...activeOneoffAuth,
      createdAt: { $gte: moment().subtract(1, "minute").toDate() },
    });

    if (existsOneoffAuth) {
      return err("Возможна отправка кода не чаще 1 раза в минуту");
    }

    // дизактивируем все старые одноразовые коды подтверждения
    await authModel.updateMany(
      activeOneoffAuth, //
      {
        $set: { enabled: false },
      }
    );

    const userPermissions = { ...permissions };
    const policyConfirmationRequired = !userPermissions.policyConfirmedAt;
    const privacyConfirmationRequired = !userPermissions.privacyConfirmedAt;

    // создадим новый одноразовый пароль с временем жизни 5 минут
    const oneOffPassword = new authModel({ ...activeOneoffAuth });
    oneOffPassword.secret = authModel.encryptPassword(`${confirmCode}`);
    oneOffPassword.expiredAt = new Date(Date.now() + 5 * 60 * 1000); // время жизни - 5 минут
    await oneOffPassword.save();

    const message = {
      title: "Код подтверждения",
      body: `Код ${confirmCode}`,
      html: `<p>Ваш код <b>${confirmCode}</b></p>`,
    };

    await Pusher.register(login, message);

    const response = new RequestCodeResponse();
    response.message = "Код подтверждения отправлен";
    response.loginType = login.type;
    Object.assign(response, {
      policyConfirmationRequired,
      privacyConfirmationRequired,
    });
    return response;
  }

  @Post("/confirm")
  @Summary("Подтвердить авторизацию по телефону")
  @RequestBody({ schema: ConfirmCodeForm })
  @Use(RateLimiter.Attach, LoginRoute.CheckLogin)
  @UseNext(LoginRoute.Token)
  @Responses(
    ConflictResponse.toJSON(),
    WrongDataResponse.toJSON(AUTH_LOGIN_WRONG_CONFIRM_CODE)
  )
  static async ConfirmCode(
    @This() auth: LoginRoute,
    @SafeBody(ConfirmCodeForm) confirmBody: ConfirmCodeForm,
    @Err(ErrorMessage) err: ErrorFunction,
    @Next() next: NextFunction
  ): Promise<ErrorResponse<ReturnType<NextFunction>>> {
    const { login } = auth;
    const { accountLoginId } = this;

    // проверим, чтобы были приняты все возможные пользовательские соглашения
    const userPermissions = { ...auth.permissions };
    const policyConfirmationRequired = !userPermissions.policyConfirmedAt;
    const privacyConfirmationRequired = !userPermissions.privacyConfirmedAt;

    if (policyConfirmationRequired && !confirmBody.policyConfirmed) {
      return new ConflictResponse(
        "Требуется согласие с пользовательским соглашением"
      );
    }

    if (privacyConfirmationRequired && !confirmBody.privacyConfirmed) {
      return new ConflictResponse(
        "Требуется согласие с политикой персональных данных",
        ConflictResponse.status
      );
    }

    const { code } = confirmBody;
    // активный одноразовый пароль
    const activeOneoffAuth = {
      [accountLoginId]: login._id,
      oneOff: true,
      enabled: true,
    };
    const authModel = this.authSchema.getModel();

    // найдем активный одноразовый код подтверждения
    const oneOffPassword = await authModel.findOne(activeOneoffAuth);

    if (
      !oneOffPassword || // если пароль не найден
      (oneOffPassword && oneOffPassword.expiredAt < new Date()) || // или истек
      !oneOffPassword.checkPassword(code) // или не прошел проверку
    ) {
      // то вернем ошибку
      return new WrongDataResponse(AUTH_LOGIN_WRONG_CONFIRM_CODE);
    }

    // дизактивируем одноразовый пароль
    await authModel.updateMany(activeOneoffAuth, {
      $set: { enabled: false },
    });

    const { userId } = login;
    // зафиксируем принятие пользовательского соглашения, если оно требовалось
    if (policyConfirmationRequired) {
      await models.UsersPermissions.updateOne(
        { userId },
        { $set: { policyConfirmedAt: new Date() } },
        { upsert: true }
      );
    }

    // зафиксируем принятие соглашения о персональных данных, если оно требовалось
    if (privacyConfirmationRequired) {
      await models.UsersPermissions.updateOne(
        { userId },
        { $set: { privacyConfirmedAt: new Date() } },
        { upsert: true }
      );
    }

    return next();
  }

  @Endpoint()
  @Responses({
    status: 200,
    schema: LoginTokenSchema,
    description: "Успешная авторизация. Возвращает bearer токен.",
  })
  static async Token(@This() { login }: LoginRoute): Promise<Token> {
    // ..
    const { accountLoginId } = this;
    const tokensModel = this.tokensSchema.getModel();
    const authToken = new tokensModel({
      [accountLoginId]: login._id,
      enabled: true,
    });

    await authToken.generateTokenData();

    return authToken;
  }
}
