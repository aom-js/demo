/* eslint-disable import/no-cycle */
import { prop } from "@typegoose/typegoose";
import { ComponentSchema } from "aom";
import { Expose, Type } from "class-transformer";
import { IsMongoId, IsNumber } from "class-validator";

import { JSONSchema } from "class-validator-jsonschema";
import { Types } from "mongoose";

import { Currencies } from "../References/Currencies";

@ComponentSchema()
export class CurrencyPrice {
  @prop({ ref: () => Currencies })
  @Expose()
  @IsMongoId()
  @JSONSchema({
    description: "Валюта",
  })
  currencyId: Types.ObjectId;

  @prop()
  @IsNumber()
  @Expose()
  @JSONSchema({
    description: "Значение",
  })
  value: number;
}
