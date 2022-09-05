import { controllers } from "models";
import { AddTag, Responses, UseNext, UseTag } from "aom";
import { Middleware, Post, Summary, This } from "aom";
import { Use, Bridge, Controller, Get, Next, NextFunction } from "aom";
import { ConflictResponse } from "common/api";

import { BodyRequest } from "./init";
import { PublicationAttachment } from "./attachment";
import { PublicationID } from "../init";

@Controller()
@AddTag("Вложения")
@Use(PublicationAttachments.Init)
@Bridge(`/attach_${PublicationAttachment}`, PublicationAttachment)
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

  @Post()
  @Summary("Добавить вложение")
  @Responses(ConflictResponse.toJSON())
  @Use(BodyRequest.Body)
  @UseNext(PublicationAttachment.Index)
  static async Add(
    @This(BodyRequest) { body }: BodyRequest,
    @This(PublicationAttachment) attachment: PublicationAttachment,
    @This() self: PublicationAttachments,
    @Next() next: NextFunction
  ) {
    attachment.body = body;
    await next(PublicationAttachment.CheckBody);
    attachment.document = await attachment.model.create({
      ...body,
      ...self.where,
    });
    return next();
  }
}
