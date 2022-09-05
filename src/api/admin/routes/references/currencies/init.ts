import { Controller } from "aom";
import { QueryFilter } from "common/api";
import { BodyBuilder, QueryBuilder } from "common/controllers";
import { Sanitize } from "common/decorators";
import { PartialSchema } from "common/functions";
import { schemas } from "models";
import { Expose } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { FilterQuery } from "mongoose";

export const schema = schemas.Currencies;

@Controller()
export class CurrencyBodyRequest extends BodyBuilder(schema) {}

@Controller()
export class CurrencyPatchRequest extends BodyBuilder(PartialSchema(schema)) {}

export class CurrencySearch extends QueryFilter {
  @Expose()
  @IsOptional()
  @Sanitize()
  @IsString()
  name?: string;
}

@Controller()
export class CurrenciesSearchFilter extends QueryBuilder(CurrencySearch) {
  async queryBuild(query: CurrencySearch) {
    const result: FilterQuery<schemas.Currencies> = {};
    if (query.name) {
      result.name = new RegExp(query.name, "i");
    }
    return result;
  }
}
