import {
  Controller,
  Endpoint,
  Get,
  Middleware,
  Next,
  NextFunction,
  Put,
} from "aom";
import { Responses, Summary, This, Patch, Use, UseNext } from "aom";
import { controllers } from "models";
import { WebSockets } from "common/controllers";
import { ItemPatchRequest, ItemBodyRequest } from "./init";
import {
  ItemsDataSocketsEmitter,
  ItemsDocumentSocketsEmitter,
  socketsDocumentStore,
} from "./sockets";

@Controller()
@Use(Item.PathID)
export class Item extends controllers.Items.document("itemId") {
  static sockets = socketsDocumentStore.server();

  static socketsParam = () => Item.paramId;

  @Get()
  @Endpoint()
  @Use(WebSockets.Param)
  @Summary("Информация о товаре")
  @Responses(Item.toJSON("Товар"))
  static async Index(@This(Item) item: Item) {
    return item.document;
  }

  @Patch()
  @Summary("Обновить документ")
  @Use(ItemPatchRequest.Attach)
  @UseNext(Item.Index)
  static async Patch(@Next() next: NextFunction) {
    return next(Item.SaveBody, Item.Emit, Item.Define);
  }

  @Put()
  @Summary("Заменить документ")
  @Use(ItemBodyRequest.Attach)
  @UseNext(Item.Index)
  static async Replace(@Next() next: NextFunction) {
    return next(Item.SaveBody, Item.Emit, Item.Define);
  }

  @Middleware()
  static async Emit(@This() { document }: Item, @Next() next: NextFunction) {
    // сообщим, что обновился список предметов
    ItemsDataSocketsEmitter(`items refreshed ${Date.now()}`);
    // сообщим, что обновился один конкретный предмет
    ItemsDocumentSocketsEmitter(
      `item ${document._id} refreshed ${Date.now()}`,
      document._id
    );
    return next();
  }
}
