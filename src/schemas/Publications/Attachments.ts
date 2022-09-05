/* eslint-disable import/no-cycle */
import { Types } from "mongoose";
import { prop, Ref } from "@typegoose/typegoose";
import { ComponentSchema } from "aom";
import { IsEnum, IsMongoId, IsOptional } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { Expose, Exclude } from "class-transformer";
import { PublicationsAttachmentsReferences } from "common/types";
import { BaseModel } from "common/schemas";

import { Publications } from "./Publications";
import { Items } from "../Shop/Items";
import { Users } from "../Users/Users";

@ComponentSchema()
@JSONSchema({ description: "Приложения к публикациям" })
export class PublicationsAttachments extends BaseModel {
  @prop({ index: true, ref: () => Publications })
  @IsMongoId()
  @IsOptional()
  @Exclude()
  @JSONSchema({ description: "ID публикации", readOnly: true })
  publicationId: Types.ObjectId;

  @prop({
    index: true,
    required: true,
    enum: PublicationsAttachmentsReferences,
  })
  @Expose()
  @IsEnum(PublicationsAttachmentsReferences)
  @JSONSchema({ description: "Связанная сущность" })
  referenceName: PublicationsAttachmentsReferences;

  @prop({ index: true, required: true, refPath: "referenceName" })
  @Expose()
  @IsMongoId()
  @JSONSchema({ description: "ID значения" })
  referenceId: Ref<Items | Users>;
}
