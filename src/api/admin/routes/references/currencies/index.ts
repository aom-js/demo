import { controllers } from "models";
import { AddTag, UseNext, UseTag } from "aom";
import { Middleware, Post, Summary, This } from "aom";
import { Use, Bridge, Controller, Get, Next, NextFunction } from "aom";

import { CurrenciesSearchFilter, CurrencyBodyRequest } from "./init";

import { Currency } from "./currency";

@Controller()
@AddTag("Валюты")
@Use(Currencies.Init)
@Bridge(`/currency_${Currency}`, Currency)
export class Currencies extends controllers.Countries.data() {
  @Middleware()
  @UseTag(Currencies)
  static async Init(@Next() next: NextFunction) {
    return next();
  }

  @Get()
  @Summary("Список валют")
  @Use(CurrenciesSearchFilter.Search)
  @UseNext(Currencies.TotalData)
  static async Index(@This() self: Currencies, @Next() next: NextFunction) {
    await self.getData();
    return next();
  }

  @Post()
  @Summary("Добавить валюту")
  @Use(CurrencyBodyRequest.Body)
  @UseNext(Currency.Index)
  static async Add(
    @This(CurrencyBodyRequest) { body }: CurrencyBodyRequest,
    @This(Currency) item: Currency,
    @Next() next: NextFunction
  ) {
    item.document = await item.model.create(body);
    return next();
  }
}
