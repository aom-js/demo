import _ from "lodash";
import { prop } from "@typegoose/typegoose";
import { IsLowercase } from "class-validator";
import { isEmail, IsEnum, IsString } from "class-validator";
import { AsYouType } from "libphonenumber-js";
import { LoginTypes } from "common/types";
import { JSONSchema } from "class-validator-jsonschema";
import { Expose, Transform } from "class-transformer";
import { Sanitize } from "common/decorators/sanitize";
import { EnabledModel } from "./enabled";

export class Logins extends EnabledModel {
  @IsEnum(LoginTypes)
  @Expose()
  @prop({ required: true, index: true })
  @JSONSchema({
    description: "Тип логина",
  })
  public type: LoginTypes;

  @IsString()
  @Expose()
  @prop({ required: true, index: true })
  @JSONSchema({
    description: "Логин",
  })
  @Transform(({ value }) => _.toLower(value))
  @IsLowercase()
  @Sanitize()
  public value: string;

  static validateValue<L extends Logins>(login: L): string {
    switch (login.type) {
      case LoginTypes.PLAIN:
        return login.value;
      case LoginTypes.EMAIL:
        return isEmail(login.value) ? _.toLower(login.value) : "";
      case LoginTypes.PHONE: {
        // по умолчанию страна - россия, чтобы распарсить телефоны, начинающиеся с 8....
        const phone1 = new AsYouType("RU");
        const phone2 = new AsYouType("RU");
        // проверим телефон в двух разных вариантах: с + и без +
        phone1.input([login.value.replace(/\D/g, "")].join(""));
        if (phone1.isValid()) {
          return phone1.getNumber().number;
        }
        phone2.input(["+", login.value.replace(/\D/g, "")].join(""));
        if (phone2.isValid()) {
          return phone2.getNumber().number;
        }
        // если ничего не вернулось, то вернем пустую строку
        return "";
      }
      default:
        return "";
    }
  }
}
