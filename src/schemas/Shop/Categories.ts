/* eslint-disable import/no-cycle */
import _ from "lodash";
import { DocumentType } from "@typegoose/typegoose";
import { modelOptions, prop, Severity } from "@typegoose/typegoose";
import { ComponentSchema } from "aom";
import { Expose, Type } from "class-transformer";
import { IsNumber, ValidateNested, IsNotEmpty } from "class-validator";
import { IsOptional, IsMongoId, IsString, IsBoolean } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { Types } from "mongoose";
import { EnabledModel } from "common/schemas";

import { Files } from "../Files";
import { Currencies } from "../References/Currencies";

@ComponentSchema()
@JSONSchema({
  description: "Категории товаров",
})
@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class ItemsCategories extends EnabledModel {
  @prop()
  @IsString()
  @IsNotEmpty()
  @Expose()
  @JSONSchema({
    description: "Название",
  })
  name!: string;

  @prop()
  @IsString()
  @Expose()
  @IsOptional()
  @JSONSchema({
    description: "Описание",
  })
  description?: string;

  @prop()
  @IsString()
  @Expose()
  @IsOptional()
  @JSONSchema({
    description: "Ссылка",
  })
  alias?: string;

  @prop({ ref: () => Files })
  @Expose()
  @IsOptional()
  @IsMongoId({ each: true })
  @JSONSchema({
    description: "Изображения",
  })
  filesId: Types.ObjectId[];
}

@ComponentSchema()
class CurrencyPrice {
  @prop({ ref: () => Currencies })
  @Expose()
  @IsMongoId()
  @JSONSchema({
    description: "Валюта",
  })
  currencyId: Types.ObjectId;

  @prop()
  @IsNumber()
  @Expose()
  @JSONSchema({
    description: "Значение",
  })
  value: number;
}
