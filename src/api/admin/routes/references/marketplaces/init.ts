import { Controller } from "aom";
import { QueryFilter } from "common/api";
import { BodyBuilder, QueryBuilder } from "common/controllers";
import { PartialSchema } from "common/functions";
import { schemas } from "models";
import { Sanitize } from "common/decorators";
import { Expose } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { FilterQuery } from "mongoose";

export const schema = schemas.Marketplaces;

@Controller()
export class MarketplaceBodyRequest extends BodyBuilder(schema) {}

@Controller()
export class MarketplacePatchRequest extends BodyBuilder(
  PartialSchema(schema)
) {}

export class MarketplacesSearch extends QueryFilter {
  @Expose()
  @IsOptional()
  @Sanitize()
  @IsString()
  name?: string;
}

@Controller()
export class MarketplacesSearchFilter extends QueryBuilder(MarketplacesSearch) {
  async queryBuild(query: MarketplacesSearch) {
    const result: FilterQuery<schemas.Marketplaces> = {};
    if (query.name) {
      result.name = new RegExp(query.name, "i");
    }
    return result;
  }
}
