import { controllers } from "models";
import { Use, UseNext, Bridge, AddTag, Middleware, UseTag } from "aom";
import { Summary, This, Controller, Get, Next, NextFunction } from "aom";

import { Category } from "./category";

@Controller()
@AddTag("Категории")
@Bridge(`/category_${Category}`, Category)
@Use(ItemsCategories.Tag)
export class ItemsCategories extends controllers.ItemsCategories.data() {
  @Middleware()
  @UseTag(ItemsCategories)
  static Tag(@Next() next: NextFunction) {
    return next();
  }

  @Get()
  @Summary("Список категорий")
  @UseNext(ItemsCategories.TotalData)
  static async Index(
    @This() self: ItemsCategories,
    @Next() next: NextFunction
  ) {
    await self.getData();
    return next();
  }
}
