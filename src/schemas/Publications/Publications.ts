/* eslint-disable import/no-cycle */
import { ComponentSchema } from "aom";
import { models } from "models";
import { prop, ReturnModelType } from "@typegoose/typegoose";
import { Expose, Type } from "class-transformer";
import { IsString, ValidateNested } from "class-validator";
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { EnabledModel } from "common/schemas";
import { AspectRatios, CommentsReferences } from "common/types";
import { CheckExistsImages, Sanitize } from "common/decorators";
import { Types } from "mongoose";

import { Files } from "../Files";
import { Users } from "../Users/Users";
import { PublicationsAttachments } from "./Attachments";
import { CommentsStats } from "../Comments/Stats";

@ComponentSchema()
@JSONSchema({ description: "Публикации" })
export class Publications extends EnabledModel {
  @prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @Expose()
  @JSONSchema({ description: "Заголовок" })
  title: string;

  @prop({ index: true })
  @IsOptional()
  @IsString()
  @Expose()
  @JSONSchema({ description: "Содержимое публикации" })
  @Sanitize()
  content?: string;

  @prop({ ref: () => Files })
  @IsMongoId({ each: true })
  @Expose()
  @IsOptional()
  @JSONSchema({ description: "Файлы" })
  @CheckExistsImages()
  filesId: Types.ObjectId[];

  @prop({ enum: AspectRatios })
  @Expose()
  @IsOptional()
  @IsEnum(AspectRatios)
  @JSONSchema({ description: "Пропорции для обрезки файлов" })
  filesAspectRatio?: AspectRatios;

  @prop({ ref: () => Users })
  @IsMongoId()
  @IsOptional()
  @JSONSchema({ description: "Автор публикации", readOnly: true })
  userId: Types.ObjectId;

  @prop({
    ref: () => Users,
    localField: "userId",
    foreignField: "_id",
    justOne: true,
  })
  @ValidateNested()
  @Type(() => Users)
  @IsOptional()
  @JSONSchema({ description: "Данные пользователя", readOnly: true })
  readonly user?: Users;

  @prop({
    ref: () => PublicationsAttachments,
    localField: "_id",
    foreignField: "publicationId",
  })
  @ValidateNested({ each: true })
  @Type(() => PublicationsAttachments)
  @IsOptional()
  @JSONSchema({ description: "Приложения к публикации", readOnly: true })
  readonly attachments?: PublicationsAttachments[];

  @prop({ type: () => CommentsStats, _id: false, index: true })
  @ValidateNested()
  @Type(() => CommentsStats)
  @IsOptional()
  @JSONSchema({ description: "Сводка по комментариям", readOnly: true })
  readonly comments?: CommentsStats;

  static async SafeDelete(
    this: ReturnModelType<typeof Publications>,
    referenceId: Types.ObjectId
  ) {
    referenceId = new Types.ObjectId(String(referenceId));
    const publication = await this.findById(referenceId);
    await this.updateOne(
      { _id: referenceId, deletedAt: null },
      { $currentDate: { deletedAt: true } }
    );
    // при удалении референсных значений удаляем только те записи, которые еще не удалены сами по себе
    const commentsReference = {
      referenceId,
      referenceName: CommentsReferences.PUBLICATIONS,
    };
    // удалим комментарии
    await models.Comments.updateMany(
      { ...commentsReference, deletedAt: null },
      { $currentDate: { deletedAt: true } }
    );

    // проверим приложения к публикации
    return publication;
  }

  static async SafeRestore(
    this: ReturnModelType<typeof Publications>,
    referenceId: Types.ObjectId
  ) {
    referenceId = new Types.ObjectId(String(referenceId));
    const publication = await this.findById(referenceId);
    const { deletedAt } = publication;
    await this.updateOne(
      { _id: referenceId, deletedAt: { $ne: null } },
      { $unset: { deletedAt: true } }
    );

    // при удалении референсных значений удаляем только те записи, которые еще не удалены сами по себе
    const commentsReference = {
      referenceId,
      referenceName: CommentsReferences.PUBLICATIONS,
    };
    // восстановим комментарии, которые были удалены вместе этой записью (то есть не раньше нее)
    await models.Comments.updateMany(
      { ...commentsReference, deletedAt: { $gte: deletedAt } },
      { $unset: { deletedAt: true } }
    );

    return publication;
  }
}
