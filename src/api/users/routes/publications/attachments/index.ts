import { controllers } from "models";
import { Use, Controller, Get, Next, NextFunction } from "aom";
import { AddTag, UseNext, UseTag, Middleware, Summary, This } from "aom";

import { PublicationID } from "../init";

@Controller()
@AddTag("Вложения")
@Use(PublicationAttachments.Init)
export class PublicationAttachments extends controllers.PublicationsAttachments.data() {
  @Middleware()
  @UseTag(PublicationAttachments)
  static async Init(
    @This(PublicationID) publication: PublicationID,
    @This() self: PublicationAttachments,
    @Next() next: NextFunction
  ) {
    self.where = { publicationId: publication._id };
    return next();
  }

  @Get()
  @Summary("Список вложений")
  @UseNext(PublicationAttachments.TotalData)
  static async Index(
    @This() self: PublicationAttachments,
    @Next() next: NextFunction
  ) {
    await self.getData();
    return next();
  }
}
