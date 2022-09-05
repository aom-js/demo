/* eslint-disable prettier/prettier */
import { BaseModel } from "common/schemas";
import { CreateDataRoute, DataRoute } from "common/controllers/data-route";
import { CreateDocumentRoute, DocumentRoute } from "common/controllers/document-route";

import schemas from "./schemas";

export class Routes<T extends typeof BaseModel> {
  data: () => typeof DataRoute<T>;

  document: (paramId?:string) => typeof DocumentRoute<T>;
}

function buildModels<
  K extends keyof typeof schemas,
  S extends typeof schemas,
  T = { [N in K]: Routes<S[N]> }
>(schemas: S): T {
  const result = {};
  Object.keys(schemas).forEach((key) => {
    const schema = schemas[key];
    const routes = new Routes();
    routes.data = () => CreateDataRoute(schema) as any;
    routes.document = (paramId?:string) => CreateDocumentRoute(schema, paramId) as any;
    Object.assign(result, { [key]: routes });
  });
  return result as T;
}

export default buildModels(schemas);
