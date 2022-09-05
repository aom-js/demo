import { AddTag, QueryParameters, UseNext, UseTag } from "aom";
import { Middleware, Post, Responses, Summary, This } from "aom";
import { Use, Bridge, Controller, Get, Next, NextFunction } from "aom";
import { controllers } from "models";
import { WrongDataResponse } from "common/api";
import { SafeQuery } from "common/decorators";
import { ERROR_QUERY_SEARCH } from "common/constants";

import { MarketplaceBodyRequest, MarketplacesSearch } from "./init";

import { Marketplace } from "./marketplace";

@Controller()
@AddTag("Торговые площадки")
@Use(Marketplaces.Tag)
@Bridge(`/marketplace_${Marketplace}`, Marketplace)
export class Marketplaces extends controllers.Marketplaces.data() {
  @Middleware()
  @UseTag(Marketplaces)
  static async Tag(@Next() next: NextFunction) {
    return next();
  }

  @Middleware()
  @QueryParameters(...MarketplacesSearch.toJSON())
  @Responses(WrongDataResponse.toJSON(ERROR_QUERY_SEARCH))
  static async Search(
    @This() self: Marketplaces,
    @SafeQuery(MarketplacesSearch) query: MarketplacesSearch,
    @Next() next: NextFunction
  ) {
    Object.assign(self.where, { ...query });
    return next();
  }

  @Get()
  @Summary("Список торговых площадок")
  @Use(Marketplaces.Search)
  @UseNext(Marketplaces.TotalData)
  static async Index(@This() self: Marketplaces, @Next() next: NextFunction) {
    await self.getData();
    return next();
  }

  @Post()
  @Summary("Добавить торговую площадку")
  @Use(MarketplaceBodyRequest.Body)
  @UseNext(Marketplace.Index)
  static async Add(
    @This(MarketplaceBodyRequest) { body }: MarketplaceBodyRequest,
    @This(Marketplace) item: Marketplace,
    @Next() next: NextFunction
  ) {
    item.document = await item.model.create(body);
    return next();
  }
}
