import { Err, Get, Next, This } from "aom";
import { Use, Post, Body, Delete, Put, Endpoint } from "aom";
import { Params, Middleware, ThisRef, Controller } from "aom";
import { NextFunction, ErrorFunction } from "aom";
import { PathParameters, RequestBody, Responses, Summary } from "aom";
import { MessageResponse, MongoID } from "common/api";
import { SafeData } from "common/decorators";
import { ErrorMessage, NotFoundResponse } from "common/api";
import { LOGIN_NOT_FOUND, LOGIN_NOT_PLAIN } from "common/constants";
import { LOGIN_PASSWORDS_MISMATCH } from "common/constants";
import { LoginTypes } from "common/types";
import { LoginsInitBase } from "./init";
import { LoginType, AuthSchemaType } from "./types";
import { Passwords } from "./passwords";

const ValidatePasswords = SafeData(Passwords);

const LoginSchema = ThisRef(
  <T extends typeof LoginsInitBase>({ loginsSchema }: T) => loginsSchema
);

@Controller()
@Use(LoginInfoBase.Init)
export class LoginInfoBase extends LoginsInitBase {
  static authSchema: AuthSchemaType;

  static param_id = "login_id";

  static toString(): string {
    return MongoID.param(this.param_id);
  }

  @Middleware()
  @PathParameters({
    [`${LoginInfoBase}`]: {
      name: LoginInfoBase.param_id,
      schema: MongoID.schema,
    },
  })
  @Responses(NotFoundResponse.toJSON())
  static async Init(
    @Params(LoginInfoBase.param_id) loginId: string,
    @This() loginBase: LoginInfoBase,
    @Err(ErrorMessage) err: ErrorFunction,
    @Next() next: NextFunction
  ): Promise<ErrorResponse<ReturnType<NextFunction>>> {
    // ..
    const loginsModel = this.loginsSchema.getModel();
    const accountId = loginBase.account._id;
    const where = {
      _id: loginId,
      [this.accountId]: accountId,
    };
    loginBase.login = await loginsModel.findOne(where);
    if (loginBase.login) {
      return next();
    }
    return err(LOGIN_NOT_FOUND, 404, { loginId });
  }

  @Get()
  @Summary("Информация о логине")
  @Responses({
    status: 200,
    description: "Логин",
    schema: LoginSchema,
  })
  static Index(@This() { login }: LoginInfoBase): LoginType {
    return login;
  }

  @Put()
  @Summary("Обновить логин")
  @RequestBody({
    description: "Логин",
    schema: LoginSchema,
  })
  @Responses({
    status: 200,
    description: "Логин",
    schema: LoginSchema,
  })
  @Use(LoginInfoBase.CheckLogin)
  static async Update(
    @This() { login, validLogin }: LoginInfoBase,
    @Next() next: NextFunction
  ): Promise<ErrorResponse<ReturnType<NextFunction>>> {
    const { _id } = login;
    const loginsModel = this.loginsSchema.getModel();
    const { value, enabled } = validLogin;
    await loginsModel.updateOne({ _id }, { $set: { value, enabled } });
    return next(LoginInfoBase.Init, LoginInfoBase.Index);
  }

  @Endpoint()
  @Post("/password")
  @Summary("Установить пароль")
  @Responses(
    {
      status: 400,
      schema: ErrorMessage,
      description: "Ошибка установки пароля",
    },
    {
      status: 200,
      schema: MessageResponse,
      description: "Пароль установлен",
    }
  )
  @RequestBody({
    description: "Пароль и подтверждение",
    schema: Passwords,
  })
  static async Password(
    @This() { login }: LoginInfoBase,
    @Body(ValidatePasswords) body: Passwords,
    @Err(ErrorMessage) err: ErrorFunction
  ): Promise<ErrorResponse<MessageResponse>> {
    // ..

    if (login.type !== LoginTypes.PLAIN) {
      return err(LOGIN_NOT_PLAIN, 400);
    }

    if (body.password !== body.passwordConfirm) {
      return err(LOGIN_PASSWORDS_MISMATCH, 400);
    }

    const authModel = this.authSchema.getModel();
    const accountLoginId = { [this.accountLoginId]: login._id };
    // заблокируем старые пароли для этого логина
    await authModel.updateMany(
      { ...accountLoginId },
      { $set: { enabled: false } }
    );

    const newPassword = new authModel({
      enabled: true,
      ...accountLoginId,
    });
    newPassword.secret = authModel.encryptPassword(body.password);
    await newPassword.save();

    return new MessageResponse("Пароль успешно установлен");
  }

  @Delete()
  @Summary("Удалить логин")
  @Responses({
    status: 200,
    description: "Логин удален",
    schema: MessageResponse,
  })
  static async Delete(
    @This() { login }: LoginInfoBase
  ): Promise<MessageResponse> {
    const { _id } = login;
    const loginsModel = this.loginsSchema.getModel();
    await loginsModel.deleteOne({ _id });
    return new MessageResponse("Логин удален");
  }
}
