/* eslint-disable import/no-cycle */
import { ComponentSchema } from "aom";
import { models } from "models";
import { Types } from "mongoose";
import { BaseModel } from "common/schemas";
import { CommentsReferences } from "common/types";
import { JSONSchema } from "class-validator-jsonschema";
import { prop, Ref, ReturnModelType } from "@typegoose/typegoose";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { Allow, IsMongoId, IsNotEmpty, ValidateNested } from "class-validator";
import { Exclude, Expose, Type } from "class-transformer";
import { ErrorMessage } from "common/api";
import { Sanitize } from "common/decorators";

import { Users } from "../Users/Users";
import { Publications } from "../Publications/Publications";
import { CommentsStats } from "./Stats";

@ComponentSchema()
@JSONSchema({ description: "Комментарии" })
export class Comments extends BaseModel {
  @prop()
  @IsString()
  @IsNotEmpty()
  @Expose()
  @JSONSchema({ description: "Содержание" })
  @Sanitize()
  text: string;

  @prop({ index: true, ref: () => Users })
  @Allow()
  @JSONSchema({
    type: "string",
    description: "ID пользователя",
    readOnly: true,
  })
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

  @prop({ index: true, ref: () => Comments })
  @IsMongoId()
  @Expose()
  @IsOptional()
  @JSONSchema({ description: "ID комментария" })
  commentId?: Types.ObjectId;

  @prop({ index: true, required: true, enum: CommentsReferences })
  @IsEnum(CommentsReferences)
  @JSONSchema({ description: "Источник значений", readOnly: true })
  @Exclude()
  referenceName: CommentsReferences;

  @prop({ index: true, required: true, refPath: "referenceName" })
  @IsMongoId()
  @JSONSchema({ description: "Идентификатор значения", readOnly: true })
  @Exclude()
  referenceId: Ref<Publications>;

  // обновить значения оценок в референсной модели
  static async RefreshCommentsStats(
    this: ReturnModelType<typeof Comments>,
    { referenceName, referenceId }
  ): Promise<CommentsStats> {
    // приведем значение идентификатора к типу (на случай использования кафки для пересчета)
    referenceId = new Types.ObjectId(String(referenceId));
    const where = { referenceName, referenceId, deletedAt: null };
    // посчитаем среднее, сумму и количество оценок
    const query = [
      { $match: { ...where } },
      {
        $group: {
          _id: "total",
          count: { $sum: 1 },
          updatedDate: { $max: "$createdAt" },
        },
      },
    ];

    const last3Comments = await this.find({ ...where })
      .sort({ createdAt: -1 })
      .limit(3);
    const lastCommentsId = last3Comments.map(({ _id }) => _id);

    const [result = {}] = await this.aggregate(query);
    const { count = 0, updatedDate = new Date(0) } = result;

    const comments: CommentsStats = { count, updatedDate, lastCommentsId };
    // если модель есть, то в ней значение по идентификатору
    if (models[referenceName]) {
      const referenceModel = models[referenceName] as any;
      await referenceModel.updateOne(
        { _id: referenceId },
        { $set: { comments } }
      );
      return comments;
    } else {
      throw new ErrorMessage(`model ${referenceName} doesn't exists!`);
    }
  }
}
