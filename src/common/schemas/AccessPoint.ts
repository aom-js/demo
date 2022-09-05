import { ComponentSchema } from "aom";
import { prop } from "@typegoose/typegoose";
import { IsOptional, IsString } from "class-validator";
import { Expose } from "class-transformer";
import { JSONSchema } from "class-validator-jsonschema";

@ComponentSchema()
@JSONSchema({ description: "Точки доступа" })
export class AccessPoint {
  @prop()
  @Expose()
  @IsOptional()
  @IsString()
  @JSONSchema({
    description: "Метод endpoint-а",
    example: "get",
  })
  method?: string;

  @prop()
  @IsString()
  @IsOptional()
  @Expose()
  @JSONSchema({
    description: "Адрес endpoint-а",
    example: "/blog/post_:id",
  })
  path?: string;

  @prop()
  @IsString()
  @IsOptional()
  @Expose()
  @JSONSchema({
    description: "Префикс адреса",
    example: "/users",
  })
  prefix?: string;
}
