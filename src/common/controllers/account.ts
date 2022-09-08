import { DocumentType } from "@typegoose/typegoose";
import { Controller, Middleware, Next, NextFunction, This, Use } from "aom";
import { models, schemas } from "models";
import { Types } from "mongoose";

import { Auth } from "./auth";
import { Logger } from "./logger";

@Controller()
export class Account {
  userId: Types.ObjectId;

  user: DocumentType<schemas.Users>;

  logins: DocumentType<schemas.UsersLogins>[];

  permissions: DocumentType<schemas.UsersPermissions>;

  @Middleware()
  static async Init(
    @This() account: Account,
    @This(Auth) auth: Auth,
    @Next() next: NextFunction
  ) {
    const user = auth.account;
    const { _id: userId } = user;

    account.userId = userId;
    //
    account.user = await models.Users.findById(userId);

    account.logins = await models.UsersLogins.find({ userId, enabled: true });

    account.permissions = await models.UsersPermissions.findOne({ userId });

    const now = new Date();
    const status = {
      isOnline: true,
      lastSeen: now,
      updatedDate: now,
    };
    await models.Users.updateOne({ _id: userId }, { $set: { status } });

    return next();
  }
}
