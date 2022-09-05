/* eslint-disable import/no-cycle */
import { prop } from "@typegoose/typegoose";
import { ComponentSchema } from "aom";
import { Allow, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { Logins } from "common/schemas/logins";

import { Types } from "mongoose";

import { Users } from "./Users";

@ComponentSchema()
export class UsersLogins extends Logins {
  @prop({ required: true, ref: () => Users })
  @Allow()
  @JSONSchema({
    type: "string",
    readOnly: true,
  })
  userId: Types.ObjectId;
}
