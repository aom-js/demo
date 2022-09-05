import _ from "lodash";
import { Expose, Type } from "class-transformer";
import { toJSONSchema } from "aom";
import { IsMongoId, IsNumber, IsOptional } from "class-validator";
import { TransformToArray } from "common/decorators/transform-to-array";
import { JSONSchema } from "class-validator-jsonschema";
import { Types } from "mongoose";
import { OpenApiParameterObject } from "aom/lib/openapi/types";

export class QueryFilter {
  static generateJSONSchema() {
    return toJSONSchema(this);
  }

  static toJSON(): OpenApiParameterObject[] {
    const jsonSchema = this.generateJSONSchema();

    const result = [];
    Object.entries(jsonSchema.properties).forEach(([key, schema]) => {
      const required = jsonSchema.required?.indexOf(key) >= 0;
      const { description } = <any>schema;
      result.push({
        name: key,
        description,
        in: "query",
        schema,
        required,
      });
    });
    return result;
  }
}

export class PagerFilter extends QueryFilter {
  @IsNumber()
  @Type(() => Number)
  @Expose()
  @IsOptional()
  @JSONSchema({
    description: "Смещение",
    default: 0,
  })
  offset = 0;

  @IsNumber()
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @JSONSchema({
    description: "Ограничение количества",
  })
  limit;
}

export class IdFilter extends QueryFilter {
  @IsMongoId({ each: true })
  @Type(() => Types.ObjectId)
  @TransformToArray()
  @Expose()
  @IsOptional()
  @JSONSchema({
    description: "Идентификатор",
  })
  _id: Types.ObjectId[];

  @IsMongoId({ each: true })
  @Type(() => Types.ObjectId)
  @TransformToArray()
  @Expose()
  @IsOptional()
  @JSONSchema({
    description: "Пропускаемый идентификатор",
  })
  skip_id: Types.ObjectId[];
}
