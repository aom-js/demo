import { schemas } from "models";

export type AccountId = "userId";

export type AccountLoginId = "userLoginId";

export type LoginsSchemaType = typeof schemas.UsersLogins;

export type AuthSchemaType = typeof schemas.UsersLoginsAuthorizations;

export type AccountType = schemas.Users;

export type LoginType = schemas.UsersLogins;
