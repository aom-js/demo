import { Expose } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";

import { LoginTypes } from "common/types";
import { CommonResponse } from "common/api";

// valid class for auth form data
export class AuthForm {
  @IsString()
  @JSONSchema({
    description: "Логин",
    example: "johnsmith",
  })
  login: string;

  @IsString()
  @JSONSchema({
    description: "Пароль",
    format: "password",
  })
  password: string;
}

export class RequestCodeForm {
  @IsString()
  @Expose()
  @JSONSchema({
    description: "Номер телефона/емейл",
    example: "johnsmith@gmail.com",
  })
  login: string;
}

export class RequestCodeResponse extends CommonResponse {
  static status = 200;

  @IsString()
  @JSONSchema({
    description: "Сообщение",
  })
  message: string;

  @IsBoolean()
  @JSONSchema({
    description: "Требуется согласие с пользовательским соглашением",
  })
  policyConfirmationRequired: boolean;

  @IsBoolean()
  @JSONSchema({
    description: "Требуется согласие с политикой персональных данных",
  })
  privacyConfirmationRequired: boolean;

  @IsEnum(LoginTypes)
  @JSONSchema({
    description: "Тип логина",
  })
  loginType: LoginTypes;
}

export class ConfirmCodeForm extends RequestCodeForm {
  @IsString()
  @Expose()
  @JSONSchema({
    description: "код подтверждения",
    example: "0939",
  })
  code: string;

  @IsBoolean()
  @Expose()
  @IsOptional()
  @JSONSchema({
    description: "Согласие с пользовательским соглашением",
  })
  policyConfirmed: boolean;

  @IsBoolean()
  @Expose()
  @IsOptional()
  @JSONSchema({
    description: "Согласие с политикой персональных данных",
  })
  privacyConfirmed: boolean;
}
