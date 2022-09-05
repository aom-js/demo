import { prop } from "@typegoose/typegoose";
import { Expose } from "class-transformer";
import { JSONSchema } from "class-validator-jsonschema";
import { QueryBoolean } from "../decorators/query-boolean";
import { BaseModel } from "./base";

export class EnabledModel extends BaseModel {
  @prop({ required: true, index: true })
  @Expose()
  @QueryBoolean()
  @JSONSchema({
    description: "Признак активности",
    default: false,
  })
  enabled: boolean;
}
