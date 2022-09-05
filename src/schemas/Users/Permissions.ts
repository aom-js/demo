/* eslint-disable import/no-cycle */
import { prop } from "@typegoose/typegoose";
import { ComponentSchema } from "aom";
import { Expose } from "class-transformer";
import { Allow } from "class-validator";
import { IsOptional, IsMongoId, IsBoolean, IsDate } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { BaseModel } from "common/schemas";
import { Types } from "mongoose";

import { Users } from "./Users";
import { Access } from "../Access";

@ComponentSchema()
export class UsersPermissions extends BaseModel {
  @prop({ ref: () => Users })
  @IsMongoId()
  @JSONSchema({
    description: "Пользователь",
    readOnly: true,
  })
  userId: Types.ObjectId;

  @Expose()
  @IsBoolean()
  @IsOptional()
  @JSONSchema({
    description: "Супер-администратор",
    default: false,
  })
  @prop({ default: () => false })
  isSuperAdmin?: boolean;

  @prop()
  @IsDate()
  @JSONSchema({
    description: "Приняты условия персональных данных",
    readOnly: true,
  })
  privacyConfirmedAt: Date;

  @prop()
  @IsDate()
  @JSONSchema({
    description: "Приняты условия пользовательского соглашения",
    readOnly: true,
  })
  policyConfirmedAt: Date;

  @Expose()
  @IsMongoId({ each: true })
  @prop({ ref: () => Access })
  accessId: Types.ObjectId[];
}
