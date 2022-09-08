import { Promise } from "bluebird";
import { Controller, Endpoint, Get, Next, NextFunction, Post, Put } from "aom";
import { Bridge, Responses, Summary, This, Patch, Use, UseNext } from "aom";
import { Logger } from "common/controllers";
//
import { PublicationAttachments } from "./attachments";
import { PublicationAttachment } from "./attachments/attachment";
import {
  PublicationPatchRequest,
  PublicationBodyRequest,
  PublicationID,
  PublicationSet,
} from "./init";

@Controller()
@Use(PublicationID.PathID)
@Bridge("/attachments", PublicationAttachments)
export class Publication {
  @Get()
  @Endpoint()
  @Use(Logger.Attach)
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

  @Patch()
  @Summary("Обновить значения")
  @Use(PublicationPatchRequest.Body)
  @UseNext(Publication.Index)
  static async Patch(
    @This(PublicationID) publication: PublicationID,
    @This(PublicationPatchRequest) { body }: PublicationPatchRequest,
    @Next() next: NextFunction
  ) {
    publication.body = body;
    return next(PublicationID.SaveBody, PublicationID.Define);
  }

  @Put()
  @Summary("Заменить значения")
  @Use(PublicationBodyRequest.Body)
  @UseNext(Publication.Index)
  static async Replace(
    @This(PublicationID) publication: PublicationID,
    @This(PublicationBodyRequest) { body }: PublicationBodyRequest,
    @Next() next: NextFunction
  ) {
    publication.body = body;
    return next(PublicationID.SaveBody, PublicationID.Define);
  }

  /*
  пример сложно-составного обновления значения, когда из единой структуры применяется набор значений
  для разных сущностей, и каждую из них последовательно проверяет уже существующий код на `aom`, который
  применим для одного аналогичного значения из специализированного метода
  */
  @Post("/set")
  @Summary("Установка полного значения")
  @Use(PublicationSet.Body)
  @UseNext(Publication.Index)
  static async Set(
    @This(PublicationID) publication: PublicationID,
    @This(PublicationSet) { body }: PublicationSet,
    @This(PublicationAttachment) attachment: PublicationAttachment,
    @This(PublicationAttachments) attachments: PublicationAttachments,
    @Next() next: NextFunction
  ) {
    // console.log(body);
    // проверим, чтобы все вложения были корректны
    await Promise.each(body.attachments, async (attachBody) => {
      attachment.body = attachBody;
      await next(PublicationAttachment.CheckBody);
    });
    // если мы оказались здесь, значит все вложения верны, и можно удалить имеющиеся
    // и добавить новые: новая проверка на существование не вызовет ошибки
    const publicationId = publication._id;
    attachments.where = { publicationId };
    await attachments.model.deleteMany(attachments.where);
    // для каждого вложения создадим новое в указанном контексте
    await Promise.map(body.attachments, async (attachBody) => {
      // результат нам не важен, подразумевается, что все произойдет без ошибок,
      // так как все данные уже проверены
      await PublicationAttachments.Add(
        { body: attachBody },
        attachment,
        attachments,
        next
      );
    });
    // заменим собственное значение публикации
    publication.body = body.publication;
    return next(PublicationID.SaveBody, PublicationID.Define);
  }
}
