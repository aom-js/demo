import { ComponentSchema, Controller, NoJSONSchema } from "aom";
import { Expose, Type } from "class-transformer";
import { IsDefined, ValidateNested } from "class-validator";
import { BodyBuilder } from "common/controllers";
import { PartialSchema, PickSchema } from "common/functions";
import { controllers } from "models";
import { schemas } from "models";
import { AttachmentsDTO } from "./attachments/init";

export const schema = schemas.Publications;

type K = keyof schemas.Publications;

const pickKeys: K[] = [
  "title",
  "content",
  "filesId",
  "enabled",
  "filesAspectRatio",
];

@ComponentSchema()
@NoJSONSchema()
class PublicationDTO extends PickSchema(schema, pickKeys) {}

@Controller()
export class PublicationBodyRequest extends BodyBuilder(PublicationDTO) {}

@Controller()
export class PublicationPatchRequest extends BodyBuilder(
  PartialSchema(schema)
) {}

@Controller()
export class PublicationID extends controllers.Publications.document("pubId") {}

@ComponentSchema()
export class PublicationSetDTO {
  @Expose()
  @ValidateNested()
  @Type(() => PublicationDTO)
  publication: PublicationDTO;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => AttachmentsDTO)
  @IsDefined()
  attachments: AttachmentsDTO[];
}

@Controller()
export class PublicationSet extends BodyBuilder(PublicationSetDTO) {}
