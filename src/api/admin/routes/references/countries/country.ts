import { Controller, Endpoint, Get, Next, NextFunction, Put } from "aom";
import { Responses, Summary, This, Patch, Use, UseNext } from "aom";
import { controllers } from "models";
import { CountryPatchRequest, CountryBodyRequest } from "./init";

@Controller()
@Use(Country.PathID)
export class Country extends controllers.Countries.document("countryId") {
  @Get()
  @Endpoint()
  @Summary("Информация о стране")
  @Responses(Country.toJSON("Страна"))
  static async Index(@This() self: Country) {
    return self.document;
  }

  @Patch()
  @Summary("Обновить значения")
  @Use(CountryPatchRequest.Attach)
  @UseNext(Country.Index)
  static async Patch(@Next() next: NextFunction) {
    return next(this.SaveBody, this.Define);
  }

  @Put()
  @Summary("Заменить значения")
  @Use(CountryBodyRequest.Attach)
  @UseNext(Country.Index)
  static async Replace(@Next() next: NextFunction) {
    return next(this.SaveBody, this.Define);
  }
}
