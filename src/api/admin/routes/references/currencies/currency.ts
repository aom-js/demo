import { Controller, Endpoint, Get, Next, NextFunction, Put } from "aom";
import { Responses, Summary, This, Patch, Use, UseNext } from "aom";
import { controllers } from "models";
import { CurrencyPatchRequest, CurrencyBodyRequest } from "./init";

@Controller()
@Use(Currency.PathID)
export class Currency extends controllers.Currencies.document("currencyId") {
  @Get()
  @Endpoint()
  @Summary("Информация о валюте")
  @Responses(Currency.toJSON("Валюта"))
  static async Index(@This() self: Currency) {
    return self.document;
  }

  @Patch()
  @Summary("Обновить значения")
  @Use(CurrencyPatchRequest.Attach)
  @UseNext(Currency.Index)
  static async Patch(@Next() next: NextFunction) {
    return next(this.SaveBody, this.Define);
  }

  @Put()
  @Summary("Заменить значения")
  @Use(CurrencyBodyRequest.Attach)
  @UseNext(Currency.Index)
  static async Replace(@Next() next: NextFunction) {
    return next(this.SaveBody, this.Define);
  }
}
