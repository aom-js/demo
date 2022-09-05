import { prop } from "@typegoose/typegoose";
import { ComponentSchema } from "aom";
import { Expose } from "class-transformer";
import { IsNumber, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { BaseModel } from "common/schemas";
import { Sanitize } from "common/decorators/sanitize";

@ComponentSchema()
@JSONSchema({ description: "Справочник валют" })
export class Currencies extends BaseModel {
  @prop()
  @Expose()
  @IsString()
  @Sanitize()
  @JSONSchema({ description: "Название" })
  name: string;

  @prop()
  @Expose()
  @IsString()
  @Sanitize()
  @JSONSchema({ description: "Символ" })
  symbol: string;

  @prop()
  @Expose()
  @IsString()
  @Sanitize()
  @JSONSchema({ description: "Название валюты ISO 4217" })
  isoName: string;

  @prop()
  @Expose()
  @IsNumber()
  @JSONSchema({ description: "Цифровой код валюты ISO 4217" })
  isoCode: number;
}
