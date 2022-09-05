import { controllers } from "models";
import { Post, Use, UseNext, Summary, This } from "aom";
import { Bridge, AddTag, Middleware, UseTag } from "aom";
import { Controller, Get, Next, NextFunction } from "aom";

import { Category } from "./category";
import { AddCategoryRequest } from "./init";

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

  @Post()
  @Summary("Создать категорию")
  @Use(AddCategoryRequest.Body)
  @UseNext(Category.Index)
  static async Add(
    @This(AddCategoryRequest) { body }: AddCategoryRequest,
    @This(Category) category: Category,
    @Next() next: NextFunction
  ) {
    category.document = await category.model.create(body);
    return next();
  }
}
