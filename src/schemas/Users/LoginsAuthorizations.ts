/* eslint-disable import/no-cycle */
import { prop } from "@typegoose/typegoose";
import { ComponentSchema } from "aom";

import { IsMongoId } from "class-validator";
import { LoginsAuthorizations } from "common/schemas";
import { Types } from "mongoose";

import { UsersLogins } from "./Logins";

@ComponentSchema()
export class UsersLoginsAuthorizations extends LoginsAuthorizations {
  @IsMongoId()
  @prop({ index: true, ref: () => UsersLogins })
  userLoginId: Types.ObjectId;
}
