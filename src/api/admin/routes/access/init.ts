import { schemas } from "models";
import { omitBaseModel, OmitSchema, PartialSchema } from "common/functions";

import { IsMongoId, IsOptional } from "class-validator";
import { Expose } from "class-transformer";
import { JSONSchema } from "class-validator-jsonschema";
import { Types } from "mongoose";
import { ComponentSchema, NoJSONSchema } from "aom";

export const dataSchema = schemas.Access;

@ComponentSchema()
@NoJSONSchema()
export class AccessDTO extends OmitSchema(dataSchema, omitBaseModel) {}

@ComponentSchema()
@NoJSONSchema()
export class AccessPartialDTO extends OmitSchema(
  PartialSchema(dataSchema),
  omitBaseModel
) {}
