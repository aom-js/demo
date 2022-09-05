import { EnabledModel } from "common/schemas";
import { ComponentSchema } from "aom";
import { prop } from "@typegoose/typegoose";
import { IsOptional, IsString, ValidateNested } from "class-validator";
import { Expose, Type } from "class-transformer";
import { JSONSchema } from "class-validator-jsonschema";
import { Sanitize } from "common/decorators";
import { AccessPoint } from "common/schemas";

@ComponentSchema()
@JSONSchema({ description: "Роли доступа" })
export class Access extends EnabledModel {
  @prop()
  @Expose()
  @IsString()
  @JSONSchema({ description: "Название роли", example: "Модератор" })
  @Sanitize()
  name: string;

  @prop({ type: () => [AccessPoint], _id: false })
  @Expose()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AccessPoint)
  points: AccessPoint[];
}
