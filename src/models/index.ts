import { getModelForClass, ReturnModelType } from "@typegoose/typegoose";

import schemas from "./schemas";
import controllers from "./controllers";
import decorators from "./decorators";

function buildModels<
  K extends keyof typeof schemas,
  S extends typeof schemas,
  T = { [N in K]: ReturnModelType<S[N]> }
>(schemas: S): T {
  const result = {};
  Object.keys(schemas).forEach((key) => {
    const schema = schemas[key];
    Object.assign(result, { [key]: getModelForClass(schema) });
  });
  return result as T;
}
const models = buildModels(schemas);

export default models;

export { models, controllers, decorators, schemas };
