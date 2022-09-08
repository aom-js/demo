import { Controller, Endpoint, Get } from "aom";
import { Bridge, Responses, Summary, This, Use } from "aom";
//
import { PublicationAttachments } from "./attachments";

import { PublicationID } from "./init";

@Controller()
@Use(PublicationID.PathID)
@Bridge("/attachments", PublicationAttachments)
export class Publication {
  @Get()
  @Endpoint()
  @Summary("Информация о публикации")
  @Responses(PublicationID.toJSON("Публикация"))
  static async Index(
    @This(PublicationID) publication: PublicationID,
    @This(PublicationAttachments) attachments: PublicationAttachments
  ) {
    attachments.where = { publicationId: publication._id };
    await attachments.getData();
    return { ...publication.document.toJSON(), attachments: attachments.data };
  }
}
