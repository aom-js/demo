import { decorators } from "models";
import { TransformToArray } from "common/decorators";
import { QueryFilter } from "common/api";
import { Expose } from "class-transformer";
import { Types } from "mongoose";
import { IsMongoId, IsOptional } from "class-validator";

export class ItemsSearch extends QueryFilter {
  @Expose()
  @IsOptional()
  @IsMongoId({ each: true })
  @TransformToArray()
  @decorators.ItemsCategories.exists()
  categoryId: Types.ObjectId[];
}
