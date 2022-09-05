import { ComponentSchema, Controller, NoJSONSchema } from "aom";
import { BodyBuilder } from "common/controllers";
import { PartialSchema, PickSchema } from "common/functions";
import { schemas } from "models";

export const schema = schemas.PublicationsAttachments;
type K = keyof schemas.PublicationsAttachments;

const pickKeys: K[] = ["referenceId", "referenceName"];

@ComponentSchema()
@NoJSONSchema()
export class AttachmentsDTO extends PickSchema(schema, pickKeys) {}

@Controller()
export class BodyRequest extends BodyBuilder(AttachmentsDTO) {}
