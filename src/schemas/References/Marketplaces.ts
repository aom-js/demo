import { prop } from "@typegoose/typegoose";
import { EnabledModel } from "common/schemas";
import { ComponentSchema } from "aom";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Expose } from "class-transformer";
import { JSONSchema } from "class-validator-jsonschema";
import { Sanitize } from "common/decorators/sanitize";

@ComponentSchema()
@JSONSchema({ description: "Рынки продаж" })
export class Marketplaces extends EnabledModel {
  @prop()
  @IsString()
  @Sanitize()
  @Expose()
  @JSONSchema({
    description: "Название",
  })
  name: string;

  @prop()
  @IsString()
  @IsOptional()
  @Expose()
  @JSONSchema({
    description: "Ссылка",
  })
  url: string;

  @prop()
  @IsString()
  @IsOptional()
  @Expose()
  @JSONSchema({
    description: "Цвет шрифта",
  })
  fontColor: string;

  @prop()
  @IsString()
  @IsOptional()
  @Expose()
  @JSONSchema({
    description: "Цвет фона",
  })
  bgColor: string;

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
