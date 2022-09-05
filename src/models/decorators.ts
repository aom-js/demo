import { C } from "ts-toolbelt";
import { BaseModel } from "common/schemas";
import { CheckExistsSchema } from "common/decorators/check-exists";
import { FilterQuery } from "mongoose";

import schemas from "./schemas";

export class Decorators<
  T extends typeof BaseModel,
  F = FilterQuery<C.Instance<T>>
> {
  exists: (where?: F) => ReturnType<typeof CheckExistsSchema>;
}

function buildModels<
  K extends keyof typeof schemas,
  S extends typeof schemas,
  T = { [N in K]: Decorators<S[N]> }
>(schemas: S): T {
  const result = {};
  Object.keys(schemas).forEach((key) => {
    const schema = schemas[key];
    const decorators = new Decorators();
    decorators.exists = (where) => CheckExistsSchema(schema, where);
    Object.assign(result, { [key]: decorators });
  });
  return result as T;
}

export default buildModels(schemas);
