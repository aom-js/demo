import { controllers } from "models";
import { Controller } from "aom";

@Controller()
export class PublicationID extends controllers.Publications.document("pubId") {}
