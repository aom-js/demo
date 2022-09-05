import { schemas } from "models";
import { DocumentType } from "@typegoose/typegoose";

export type Account = DocumentType<schemas.Users>;

export type Login = DocumentType<schemas.UsersLogins>;

export type Token = DocumentType<schemas.UsersLoginsTokens>;

export type UserPermissions = DocumentType<schemas.UsersPermissions>;

export class AuthBase {
  static url: string;

  static accountId = "userId";

  static accountLoginId = "userLoginId";

  static accountSchema = schemas.Users;

  static loginsSchema = schemas.UsersLogins;

  static authSchema = schemas.UsersLoginsAuthorizations;

  static tokensSchema = schemas.UsersLoginsTokens;

  login: Login;

  account: Account;

  token: Token;

  permissions: UserPermissions;
}
