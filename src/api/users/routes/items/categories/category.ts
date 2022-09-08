import { controllers } from "models";
import { Controller, Endpoint, Get, Responses, Summary, This, Use } from "aom";

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
}
