import * as schemas from "schemas";
import { PickSchema } from "common/functions";
import { ComponentSchema, NoJSONSchema } from "aom";

@ComponentSchema()
@NoJSONSchema()
export class UserInviteDTO extends PickSchema(schemas.UsersInvites, [
  "message",
]) {}
