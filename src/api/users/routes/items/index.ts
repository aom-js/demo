import { Middleware, Responses, Summary } from "aom";
import { This, Use, Bridge, Controller, Get, Next, NextFunction } from "aom";
import { AddTag, MergeNextTags, QueryParameters, UseNext, UseTag } from "aom";
import { controllers } from "models";
import { WrongDataResponse } from "common/api";
import { SafeQuery } from "common/decorators";
import { ERROR_QUERY_SEARCH } from "common/constants";

import { ItemsSearch } from "./init";
import { ItemsCategories } from "./categories";
import { Item } from "./item";

@Controller()
@AddTag("Товары")
@Bridge(`/categories`, ItemsCategories)
@Bridge(`/item_${Item}`, Item)
@Use(Items.Tag)
export class Items extends controllers.Items.data() {
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
  @Use(Items.Search)
  @UseNext(Items.TotalData)
  static async Index(@This() self: Items, @Next() next: NextFunction) {
    await self.getData();
    return next();
  }
}
