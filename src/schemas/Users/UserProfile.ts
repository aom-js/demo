/* eslint-disable import/no-cycle */
import { prop } from "@typegoose/typegoose";

import { ComponentSchema } from "aom";

import { Expose, Type } from "class-transformer";
import { IsDate, IsString, IsOptional } from "class-validator";
import { IsEnum, MinLength, IsMongoId } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { CheckExistsFiles, Sanitize, TransformToDate } from "common/decorators";
import { Genders } from "common/types";
import { Types } from "mongoose";

import { Files } from "../Files";

@ComponentSchema()
export class UserProfile {
  @prop({ index: true })
  @Expose()
  @MinLength(2)
  @IsString()
  @JSONSchema({
    description: "Имя",
    example: "Иван",
  })
  @Sanitize()
  name: string;

  @prop({ index: true })
  @IsOptional()
  @Expose()
  @IsString()
  @JSONSchema({
    description: "Фамилия",
    example: "Петров",
  })
  @Sanitize()
  surname?: string;

  @prop()
  @IsOptional()
  @Expose()
  @IsString()
  @JSONSchema({
    description: "Отчество",
    example: "Васильевич",
  })
  @Sanitize()
  middlename?: string;

  @prop()
  @Expose()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @TransformToDate()
  @JSONSchema({
    description: "Дата рождения",
  })
  birthDate?: Date;

  @prop()
  @Expose()
  @IsOptional()
  @IsString()
  @JSONSchema({
    description: "Описание",
  })
  @Sanitize()
  description?: string;

  @prop({ enum: Genders })
  @Expose()
  @IsOptional()
  @IsEnum(Genders)
  @JSONSchema({
    description: "Пол",
  })
  gender?: Genders;

  @prop({ ref: () => Files })
  @IsMongoId()
  @IsOptional()
  @JSONSchema({
    description: "Id фотографии",
    readOnly: true,
  })
  @CheckExistsFiles()
  fileId?: Types.ObjectId;
}
