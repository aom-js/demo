/* eslint-disable import/no-cycle */
import { models } from "models";
import { pre, prop, ReturnModelType } from "@typegoose/typegoose";
import { ComponentSchema } from "aom";
import { Expose, Type } from "class-transformer";
import { ValidateNested, IsNumber, IsOptional } from "class-validator";

import { JSONSchema } from "class-validator-jsonschema";
import { EnabledModel } from "common/schemas";

import { LoginTypes } from "common/types";
import { UsersLogins } from "./Logins";
import { UserProfile } from "./UserProfile";

@JSONSchema({ description: "Пользователи" })
@ComponentSchema()
@pre<Users>("save", async function () {
  if (!this.ident) {
    this.ident = await models.Users.getNextIdent();
  }
})
export class Users extends EnabledModel {
  @prop({ index: true })
  @IsNumber()
  @IsOptional()
  @JSONSchema({ description: "Номер по порядку", readOnly: true })
  ident?: number;

  @prop()
  @ValidateNested()
  @Expose()
  @Type(() => UserProfile)
  @IsOptional()
  @JSONSchema({ description: "Профиль пользовател" })
  profile?: UserProfile;

  @prop({
    ref: () => UsersLogins,
    foreignField: "userId",
    localField: "_id",
    justOne: true,
    match: { enabled: true, type: LoginTypes.PLAIN },
  })
  @ValidateNested()
  @Type(() => UsersLogins)
  @IsOptional()
  @JSONSchema({
    readOnly: true,
    description: "Логин",
  })
  readonly userLogin?: UsersLogins;

  @prop({
    ref: () => UsersLogins,
    foreignField: "userId",
    localField: "_id",
    justOne: false,
  })
  @ValidateNested({ each: true })
  @Type(() => UsersLogins)
  @IsOptional()
  @JSONSchema({
    readOnly: true,
    description: "Логины пользователя",
  })
  readonly logins?: UsersLogins;

  static async getNextIdent(this: ReturnModelType<typeof Users>) {
    const { ident = 0 } = {
      ...(await this.findOne().sort({ ident: -1 }).lean()),
    };
    return ident + 1;
  }
}
