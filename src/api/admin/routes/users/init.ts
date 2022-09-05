import _ from "lodash";
import { C } from "ts-toolbelt";
import { controllers, models, schemas } from "models";
import { DocumentType } from "@typegoose/typegoose";

import {
  omitBaseModel,
  PickSchema,
  OmitSchema,
  PartialSchema,
} from "common/functions";
import { Sanitize, QueryBoolean } from "common/decorators";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Expose } from "class-transformer";
import { ComponentSchema, Controller, NoJSONSchema } from "aom";
import { JSONSchema } from "class-validator-jsonschema";
import { QueryFilter } from "common/api";
import { QueryBuilder } from "common/controllers";
import { FilterQuery } from "mongoose";
import { LoginTypes } from "common/types";

export const dataSchema = schemas.Users;

export type dataType = C.Instance<typeof dataSchema>;

export type documentDataType = DocumentType<schemas.Users>;

type K = keyof dataType;

const pickAttrs: K[] = ["profile", "enabled"];

@ComponentSchema()
@NoJSONSchema()
export class UserDTO extends PickSchema(dataSchema, pickAttrs) {}

@ComponentSchema()
@NoJSONSchema()
export class UserPartialDTO extends PickSchema(
  PartialSchema(dataSchema),
  pickAttrs
) {}

@ComponentSchema()
@NoJSONSchema()
export class UserLoginCheckDTO extends OmitSchema(schemas.UsersLogins, [
  ...omitBaseModel,
  "enabled",
]) {}

@ComponentSchema()
@NoJSONSchema()
export class UserPermissionDTO extends OmitSchema(
  schemas.UsersPermissions,
  omitBaseModel
) {}

export class UsersFilterQuery extends QueryFilter {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @Sanitize()
  @IsOptional()
  @JSONSchema({ description: "Логин или имя пользователя" })
  username: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @Sanitize()
  @IsOptional()
  @JSONSchema({ description: "Телефон" })
  phone: string;

  @Expose()
  @IsEmail()
  @IsNotEmpty()
  @Sanitize()
  @IsOptional()
  @JSONSchema({ description: "Email" })
  email: string;

  @Expose()
  @IsOptional()
  @QueryBoolean()
  @JSONSchema({ description: "Ни разу не авторизовывались" })
  unauthorized: boolean;
}

@Controller()
export class UsersFilter extends QueryBuilder(UsersFilterQuery) {
  async queryBuild(query: UsersFilterQuery) {
    // const { ctx } = this;
    // const { $StateMap } = ctx;
    const result: FilterQuery<schemas.Users> = {};
    const $and = [];
    // фильтр по тем, кто не прошел авторизацию
    if (query.unauthorized) {
      // найдем тех, кто не принял пользовательские соглашения
      const usersId = await models.UsersPermissions.aggregateToSet(
        { privacyConfirmedAt: { $ne: null }, policyConfirmedAt: { $ne: null } },
        "userId"
      );
      Reflect.deleteProperty(query, "unauthorized");
      $and.push({ _id: { $nin: usersId } });
    }

    if (query.username) {
      const _id = [];
      // вот это  потом надо будет вынести на какой-нибудь еластик
      const nameParts = _.split(
        query.username.replace(/\?,\*,\./g, ""),
        " "
      ).map(_.trim);
      const regExp = new RegExp(`${nameParts.join("|")}`, "i");
      const loginsUsersId = await models.UsersLogins.aggregateToSet(
        {
          type: LoginTypes.PLAIN,
          enabled: true,
          value: regExp,
        },
        "userId"
      );
      _id.push(...loginsUsersId);
      const usersId = await models.Users.aggregateToSet(
        {
          $or: [{ "profile.name": regExp }, { "profile.surname": regExp }],
        },
        "_id"
      );
      _id.push(...usersId, null);
      Reflect.deleteProperty(query, "username");
      $and.push({ _id: { $in: _id } });
    }

    if (query.phone) {
      const _id = [];
      const phone = models.UsersLogins.validateValue({
        value: query.phone,
        type: LoginTypes.PHONE,
      } as any);
      const loginsUsersId = await models.UsersLogins.aggregateToSet(
        {
          type: LoginTypes.PHONE,
          enabled: true,
          value: phone,
        },
        "userId"
      );
      _id.push(...loginsUsersId);
      Reflect.deleteProperty(query, "phone");
      $and.push({ _id: { $in: _id } });
    }

    if (query.email) {
      const _id = [];
      const email = models.UsersLogins.validateValue(
        new models.UsersLogins({
          value: query.email,
          type: LoginTypes.EMAIL,
        })
      );
      const loginsUsersId = await models.UsersLogins.aggregateToSet(
        {
          type: LoginTypes.EMAIL,
          enabled: true,
          value: email,
        },
        "userId"
      );
      _id.push(...loginsUsersId);
      Reflect.deleteProperty(query, "email");
      $and.push({ _id: { $in: _id } });
    }

    if ($and.length > 0) {
      Object.assign(query, { $and });
    }
    return query;
  }
}

@Controller()
export class UserID extends controllers.Users.document("userId") {}
