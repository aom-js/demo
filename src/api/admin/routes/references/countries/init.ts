import { Controller } from "aom";
import { QueryFilter } from "common/api";
import { BodyBuilder, QueryBuilder } from "common/controllers";
import { PartialSchema } from "common/functions";
import { schemas } from "models";
import { Sanitize } from "common/decorators";
import { Expose } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { FilterQuery } from "mongoose";

export const schema = schemas.Countries;

@Controller()
export class CountryBodyRequest extends BodyBuilder(schema) {}

@Controller()
export class CountryPatchRequest extends BodyBuilder(PartialSchema(schema)) {}

export class CountriesSearch extends QueryFilter {
  @Expose()
  @IsOptional()
  @Sanitize()
  @IsString()
  name?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @Sanitize()
  code?: string;
}

@Controller()
export class CountriesSearchFilter extends QueryBuilder(CountriesSearch) {
  async queryBuild(query: CountriesSearch) {
    const result: FilterQuery<schemas.Countries> = {};
    if (query.name) {
      result.name = new RegExp(query.name, "i");
    }
    if (query.code) {
      result.code = query.code;
    }
    return result;
  }
}
