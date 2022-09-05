/* eslint-disable import/no-cycle */
import { prop } from "@typegoose/typegoose";
import { ComponentSchema } from "aom";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { IsDate, IsMongoId, IsNumber, IsOptional } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { Types } from "mongoose";

import { Comments } from "./Comments";

@ComponentSchema()
@JSONSchema({ description: "Сводка по комментариям", readOnly: true })
export class CommentsStats {
  @prop({ index: true })
  @IsNumber()
  @IsOptional()
  @JSONSchema({ description: "Количество комментариев", readOnly: true })
  count: number;

  @prop({ ref: () => Comments })
  @IsMongoId({ each: true })
  @IsOptional()
  @JSONSchema({ description: "ID последних комментариев", readOnly: true })
  lastCommentsId: Types.ObjectId[];

  @prop({
    ref: () => Comments,
    localField: "lastCommentsId",
    foreignField: "_id",
  })
  @ValidateNested({ each: true })
  @Type(() => Comments)
  @IsOptional()
  readonly lastComments?: Comments[];

  @prop({ default: new Date(0) })
  @IsDate()
  @IsOptional()
  @JSONSchema({ description: "Дата обновления", readOnly: true })
  updatedDate: Date;
}
