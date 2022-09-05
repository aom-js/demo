import { DocumentType } from "@typegoose/typegoose";
import { models, schemas } from "models";
import { RequestBody, Responses, AddTag, Controller, Get, Summary } from "aom";
import { Put, Middleware, Next, NextFunction, This, Use, UseTag } from "aom";
import { SafeBody } from "common/decorators";
import { AccessAdmin } from "common/controllers";

import { UserID, UserPermissionDTO } from "./init";

type UserPermissionsType = DocumentType<schemas.UsersPermissions>;

@Controller()
@AddTag("Полномочия пользователя")
@Use(AccessAdmin.Required, UserPermissions.Init)
export class UserPermissions {
  // ...
  permissions: UserPermissionsType;

  @Middleware()
  @UseTag(UserPermissions)
  static async Init(
    @This() data: UserPermissions,
    @This(UserID) user: UserID,
    @Next() next: NextFunction
  ): Promise<ReturnType<NextFunction>> {
    const userId = user._id;
    data.permissions = await models.UsersPermissions.findOne({ userId });
    return next();
  }

  @Get()
  @Summary("Полномочия пользователя")
  @Responses({
    status: 200,
    description: "Полномочия пользователя",
    schema: schemas.UsersPermissions,
  })
  static Index(@This() { permissions }: UserPermissions): UserPermissionsType {
    return permissions;
  }

  @Put()
  @Summary("Обновить полномочия пользователя")
  @RequestBody({ schema: UserPermissionDTO })
  @Responses({
    status: 200,
    description: "Полномочия пользователя",
    schema: schemas.UsersPermissions,
  })
  @Use(AccessAdmin.Required)
  static async Update(
    @SafeBody(UserPermissionDTO)
    userRermissions: schemas.UsersPermissions,
    @This(UserID) user: UserID,
    @Next() next: NextFunction
  ): Promise<ReturnType<NextFunction>> {
    const userId = user._id;
    await models.UsersPermissions.updateOne(
      { userId },
      { $set: { ...userRermissions } },
      { upsert: true }
    );
    return next(this.Init, this.Index);
  }
}
