import { controllers } from "models";
import { Middleware, Summary, This, MergeNextTags, UseNext, UseTag } from "aom";
import { Use, AddTag, Bridge, Controller, Get, Next, NextFunction } from "aom";

import { PublicationID } from "./init";

import { Publication } from "./publication";

@Controller()
@AddTag("Публикации")
@Use(Publications.Init)
@Bridge(`/publication_${PublicationID}`, Publication)
export class Publications extends controllers.Publications.data() {
  @Middleware()
  @UseTag(Publications)
  @MergeNextTags()
  static async Init(@This() self: Publications, @Next() next: NextFunction) {
    self.populates.add({ path: "attachments" });
    return next();
  }

  @Get()
  @Summary("Список публикаций")
  @UseNext(Publications.TotalData)
  static async Index(@This() self: Publications, @Next() next: NextFunction) {
    await self.getData();
    return next();
  }
}
