import { schemas, controllers } from "models";
import { Err, ErrorFunction, Next, NextFunction } from "aom";
import { Controller, Endpoint, Get, Put, Use, UseNext } from "aom";
import { Middleware, Responses, Summary, This } from "aom";
import { AccessDenyResponse, ConflictResponse } from "common/api";

import { PublicationID } from "../init";
import { BodyRequest } from "./init";

@Controller()
@Use(PublicationAttachment.PathID, PublicationAttachment.Init)
export class PublicationAttachment extends controllers.PublicationsAttachments.document(
  "attachId"
) {
  @Middleware()
  @Responses(AccessDenyResponse.toJSON("Некорректное вложение"))
  static async Init(
    @This() self: PublicationAttachment,
    @This(PublicationID) publication: PublicationID,
    @Err(AccessDenyResponse) err: ErrorFunction,
    @Next() next: NextFunction
  ) {
    if (!self.document.publicationId.equals(publication._id)) {
      return err("Некорректное вложение", AccessDenyResponse.status);
    }
    return next();
  }

  @Get()
  @Endpoint()
  @Summary("Информация о вложении")
  @Responses(PublicationAttachment.toJSON("Вложение"))
  static async Index(@This() self: PublicationAttachment) {
    return self.document;
  }

  @Put()
  @Summary("Заменить значения")
  @Use(BodyRequest.Attach)
  @UseNext(PublicationAttachment.Index)
  static async Replace(@Next() next: NextFunction) {
    return next(this.CheckBody, this.SaveBody, this.Define);
  }

  @Middleware()
  @Responses(ConflictResponse.toJSON())
  static async CheckBody(
    @This() { body }: PublicationAttachment,
    @Err(ConflictResponse) err: ErrorFunction,
    @Next() next: NextFunction
  ) {
    const { referenceName, referenceId } = body;
    const referenceSchema = schemas[referenceName];
    if (referenceSchema) {
      const exitsDocument = await referenceSchema
        .getModel()
        .findById(referenceId);
      if (exitsDocument) return next();
    }
    return err("Некорректный состав вложений", ConflictResponse.status, body);
  }
}
