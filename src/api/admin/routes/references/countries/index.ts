import { AddTag, UseNext, UseTag } from "aom";
import { Middleware, Post, Summary, This } from "aom";
import { Use, Bridge, Controller, Get, Next, NextFunction } from "aom";
import { controllers } from "models";

import { CountryBodyRequest, CountriesSearchFilter } from "./init";

import { Country } from "./country";

@Controller()
@AddTag("Страны")
@Use(Countries.Init)
@Bridge(`/country_${Country}`, Country)
export class Countries extends controllers.Countries.data() {
  @Middleware()
  @UseTag(Countries)
  static async Init(@Next() next: NextFunction) {
    return next();
  }

  @Get()
  @Summary("Список стран")
  @Use(CountriesSearchFilter.Search)
  @UseNext(Countries.TotalData)
  static async Index(@This() self: Countries, @Next() next: NextFunction) {
    await self.getData();
    return next();
  }

  @Post()
  @Summary("Добавить страну")
  @Use(CountryBodyRequest.Body)
  @UseNext(Country.Index)
  static async Add(
    @This(CountryBodyRequest) { body }: CountryBodyRequest,
    @This(Country) item: Country,
    @Next() next: NextFunction
  ) {
    item.document = await item.model.create(body);
    return next();
  }
}
