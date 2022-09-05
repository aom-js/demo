import { C } from "ts-toolbelt";
import { prop, modelOptions } from "@typegoose/typegoose";
import { getModelForClass, ReturnModelType } from "@typegoose/typegoose";

import { Base } from "@typegoose/typegoose/lib/defaultClasses";
import { JSONSchema } from "class-validator-jsonschema";
import { IsOptional, Allow } from "class-validator";
import { FilterQuery, Types } from "mongoose";

@modelOptions({ schemaOptions: { timestamps: true } })
export class BaseModel implements Base {
  @Allow()
  @JSONSchema({
    description: "Id",
    type: "string",
    readOnly: true,
    example: new Types.ObjectId(),
  })
  readonly _id: Types.ObjectId;

  @prop()
  id: string;

  @prop()
  @Allow()
  @JSONSchema({
    type: "string",
    format: "date-time",
    description: "Дата создания",
    readOnly: true,
    example: new Date(Date.now() - 100000),
  })
  createdAt: Date;

  @prop()
  @Allow()
  @JSONSchema({
    type: "string",
    format: "date-time",
    description: "Дата обновления",
    readOnly: true,
    example: new Date(),
  })
  updatedAt: Date;

  @Allow()
  @JSONSchema({
    type: "string",
    format: "date-time",
    description: "Дата удаления",
    readOnly: true,
    example: new Date(),
  })
  @prop({ index: true })
  deletedAt: Date;

  static getModel<U extends typeof BaseModel>(this: U): ReturnModelType<U> {
    return getModelForClass(this);
  }

  // быстрая аггрегация в уникальный список: возвращает список из значений, указанных вторым аргументом
  // в общем случае используется для поиска вхождений
  static async aggregateToSet<
    U extends ReturnModelType<typeof BaseModel>,
    M extends C.Instance<U>,
    K extends keyof M
  >(this: U, $match: FilterQuery<M>, field: K = <K>"_id"): Promise<M[K][]> {
    const pipeline = [
      { $match },
      {
        $group: {
          _id: `set_${String(field)}`,
          _set: { $addToSet: `$${String(field)}` },
        },
      },
    ];
    const [result = {}] = await this.aggregate(pipeline);
    return result._set || [];
  }
}
