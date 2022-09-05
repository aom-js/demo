import { AddTag, MergeNextTags, UseNext, UseTag } from "aom";
import { Middleware, Post, Summary, This } from "aom";
import { Use, Bridge, Controller, Get, Next, NextFunction } from "aom";
import { controllers } from "models";

import { PublicationBodyRequest, PublicationID } from "./init";

import { Publication } from "./publication";

@Controller()
@AddTag("Публикации")
@Use(Publications.Init)
@Bridge(`/publication_${PublicationID}`, Publication)
export class Publications extends controllers.Publications.data() {
  @Middleware()
  @UseTag(Publications)
  @MergeNextTags()
  static async Init(@Next() next: NextFunction) {
    return next();
  }

  @Get()
  @Summary("Список публикаций")
  @UseNext(Publications.TotalData)
  static async Index(@This() self: Publications, @Next() next: NextFunction) {
    await self.getData();
    return next();
  }

  @Post()
  @Summary("Добавить публикацию")
  @Use(PublicationBodyRequest.Body)
  @UseNext(Publication.Index)
  static async Add(
    @This(PublicationBodyRequest) { body }: PublicationBodyRequest,
    @This(PublicationID) publication: PublicationID,
    @Next() next: NextFunction
  ) {
    publication.document = await publication.model.create(body);
    return next();
  }
}
