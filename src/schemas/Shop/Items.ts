/* eslint-disable import/no-cycle */
import _ from "lodash";
import { prop, pre, DocumentType, ReturnModelType } from "@typegoose/typegoose";
import { ComponentSchema } from "aom";
import { Expose, Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { IsOptional, IsMongoId, IsString, IsNotEmpty } from "class-validator";
import { CheckExists } from "common/decorators";
import { EnabledModel } from "common/schemas";
import { JSONSchema } from "class-validator-jsonschema";

import { Types } from "mongoose";

import { ItemsCategories } from "./Categories";
import { CurrencyPrice } from "./CurrencyPrice";

@ComponentSchema()
@JSONSchema({
  description: "Товары",
})
export class Items extends EnabledModel {
  @prop({ index: true })
  @IsString()
  @IsNotEmpty()
  @Expose()
  @JSONSchema({
    description: "Название",
  })
  name: string;

  @prop({})
  @IsString()
  @IsOptional()
  @Expose()
  @JSONSchema({
    description: "Описание",
  })
  description?: string;

  @prop({ ref: () => ItemsCategories })
  @Expose()
  @IsOptional()
  @CheckExists(() => ItemsCategories)
  @IsMongoId()
  @JSONSchema({
    description: "Категория",
  })
  categoryId?: Types.ObjectId;

  @prop({
    ref: () => ItemsCategories,
    foreignField: "_id",
    localField: "categoryId",
    justOne: true,
  })
  @ValidateNested()
  @Type(() => ItemsCategories)
  @IsOptional()
  @JSONSchema({ description: "Категория", readOnly: true })
  readonly category?: ItemsCategories;

  @prop({ type: () => CurrencyPrice, _id: false })
  @ValidateNested({ each: true })
  @IsOptional()
  @Expose()
  @Type(() => CurrencyPrice)
  @JSONSchema({ description: "Цена в валютах" })
  prices?: CurrencyPrice[];
}
