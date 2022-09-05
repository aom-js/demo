import { AddTag, MergeNextTags, QueryParameters, UseNext, UseTag } from "aom";
import { Middleware, Post, Responses, Summary, This } from "aom";
import { Use, Bridge, Controller, Get, Next, NextFunction } from "aom";
import { controllers } from "models";
import { WrongDataResponse } from "common/api";
import { SafeQuery } from "common/decorators";
import { ERROR_QUERY_SEARCH } from "common/constants";
import { WebSockets, AccessAdmin } from "common/controllers";

import { ItemBodyRequest, ItemsSearch } from "./init";
import { ItemsCategories } from "./categories";
import { Item } from "./item";
import { socketsDataStore } from "./sockets";

@Controller()
@AddTag("Товары")
@Bridge("/categories", ItemsCategories)
@Bridge(`/item_${Item}`, Item)
@Use(AccessAdmin.Required)
@Use(Items.Tag)
export class Items extends controllers.Items.data() {
  static sockets = socketsDataStore.server();

  @Middleware()
  @UseTag(Items)
  @MergeNextTags()
  static Tag(@Next() next: NextFunction) {
    return next();
  }

  @Middleware()
  @QueryParameters(...ItemsSearch.toJSON())
  @Responses(WrongDataResponse.toJSON(ERROR_QUERY_SEARCH))
  static async Search(
    @This() self: Items,
    @SafeQuery(ItemsSearch) query: ItemsSearch,
    @Next() next: NextFunction
  ) {
    Object.assign(self.where, { ...query });
    return next();
  }

  @Get()
  @Summary("Список предметов")
  @Use(Items.Search, WebSockets.Init)
  @UseNext(Items.TotalData)
  static async Index(@This() self: Items, @Next() next: NextFunction) {
    await self.getData();
    return next();
  }

  @Post()
  @Summary("Создать предмет")
  @Use(ItemBodyRequest.Body)
  @UseNext(Item.Index)
  static async Add(
    @This(ItemBodyRequest) { body }: ItemBodyRequest,
    @This(Item) item: Item,
    @Next() next: NextFunction
  ) {
    item.document = await item.model.create(body);
    return next(Item.Emit);
  }
}
