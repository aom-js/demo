import { EnabledModel } from "common/schemas";
import { Types } from "mongoose";
import { Sanitize } from "common/decorators/sanitize";
import { Expose } from "class-transformer";

import { prop } from "@typegoose/typegoose";
import { IsOptional, IsMongoId, IsString, IsNumber } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";

import { Marketplaces } from "./Marketplaces";

export class Countries extends EnabledModel {
  @prop({ required: true })
  @IsString()
  @Expose()
  @Sanitize()
  @JSONSchema({ description: "Название" })
  name: string;

  @prop({ index: true })
  @IsString()
  @Expose()
  @IsOptional()
  @JSONSchema({ description: "Код" })
  code: string;

  @prop({ ref: () => Marketplaces })
  @IsMongoId({ each: true })
  @Expose()
  @IsOptional()
  @JSONSchema({ description: "Доступные торговые площадки" })
  marketplacesId?: Types.ObjectId[];

  @prop({ index: true })
  @IsNumber()
  @IsOptional()
  @Expose()
  @JSONSchema({
    description: "Позиция по порядку",
    readOnly: true,
  })
  readonly orderPosition?: number;
}
