import { Controller, Endpoint, Get, Next, NextFunction, Put } from "aom";
import { Responses, Summary, This, Patch, Use, UseNext } from "aom";
import { controllers } from "models";
import { MarketplacePatchRequest, MarketplaceBodyRequest } from "./init";

@Controller()
@Use(Marketplace.PathID)
export class Marketplace extends controllers.Marketplaces.document(
  "markerplaceId"
) {
  @Get()
  @Endpoint()
  @Summary("Информация о торговой площадке")
  @Responses(Marketplace.toJSON("Торговая площадка"))
  static async Index(@This() self: Marketplace) {
    return self.document;
  }

  @Patch()
  @Summary("Обновить значения")
  @Use(MarketplacePatchRequest.Attach)
  @UseNext(Marketplace.Index)
  static async Patch(@Next() next: NextFunction) {
    return next(this.SaveBody, this.Define);
  }

  @Put()
  @Summary("Заменить значения")
  @Use(MarketplaceBodyRequest.Attach)
  @UseNext(Marketplace.Index)
  static async Replace(@Next() next: NextFunction) {
    return next(this.SaveBody, this.Define);
  }
}
