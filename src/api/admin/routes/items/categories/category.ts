import { controllers } from "models";
import { Controller, Endpoint, Get, Next, NextFunction, Patch, Put } from "aom";
import { Responses, Summary, This, Use, UseNext } from "aom";
import { AddCategoryRequest, PatchCategoryRequest } from "./init";

@Controller()
@Use(Category.PathID)
export class Category extends controllers.ItemsCategories.document(
  "categoryId"
) {
  @Get()
  @Endpoint()
  @Summary("Информация о категории")
  @Responses(Category.toJSON())
  static async Index(@This() self: Category) {
    return self.document;
  }

  @Patch()
  @Summary("Изменить отдельные свойства")
  @Use(PatchCategoryRequest.Attach)
  @UseNext(Category.Index)
  static async Patch(@Next() next: NextFunction) {
    return next(this.SaveBody, this.Define);
  }

  @Put()
  @Summary("Перезаписать свойства")
  @Use(AddCategoryRequest.Attach)
  @UseNext(Category.Index)
  static async Put(@Next() next: NextFunction) {
    return next(this.SaveBody, this.Define);
  }
}
