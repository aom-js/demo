import { PickSchema } from "common/functions";
import { TransformToArray } from "common/decorators";
import { ComponentSchema, Controller, NoJSONSchema } from "aom";
import { QueryFilter } from "common/api";
import { BodyBuilder } from "common/controllers";
import { PartialSchema } from "common/functions";
import { schemas, decorators, controllers } from "models";
import { Expose } from "class-transformer";
import { Types } from "mongoose";
import { IsMongoId, IsOptional } from "class-validator";

export const schema = schemas.Items;

@ComponentSchema()
@NoJSONSchema()
export class ItemBody extends PickSchema(schema, [
  "name",
  "description",
  "categoryId",
  "prices",
  "enabled",
]) {}

@Controller()
export class ItemBodyRequest extends BodyBuilder(ItemBody) {}

@Controller()
export class ItemPatchRequest extends BodyBuilder(PartialSchema(ItemBody)) {}

export class ItemsSearch extends QueryFilter {
  @Expose()
  @IsOptional()
  @IsMongoId({ each: true })
  @TransformToArray()
  @decorators.ItemsCategories.exists()
  categoryId: Types.ObjectId[];
}
