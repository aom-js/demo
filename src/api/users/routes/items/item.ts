import { controllers } from "models";
import { Responses, Summary, This, Use, Controller, Endpoint, Get } from "aom";

@Controller()
@Use(Item.PathID)
export class Item extends controllers.Items.document("itemId") {
  @Get()
  @Endpoint()
  @Summary("Информация о товаре")
  @Responses(Item.toJSON("Товар"))
  static async Index(@This(Item) item: Item) {
    return item.document;
  }
}
