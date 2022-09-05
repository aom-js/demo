import { C } from "ts-toolbelt";
import { IsOptional } from "class-validator";
import { Exclude } from "class-transformer";
import { ClassConstructor } from "aom/lib/common/declares";
import { NoJSONSchema, toJSONSchema } from "aom";

export const omitBaseModel = ["_id", "createdAt", "updatedAt"] as any;

function createOmitSchema<
  TBase extends ClassConstructor,
  K extends keyof C.Instance<TBase>
>(Base: TBase, omitKeys: K[] = []) {
  const jsonSchema = {
    type: "object",
    properties: {},
    ...toJSONSchema(Base),
  };

  Object.keys(jsonSchema.properties).forEach((propertyName) => {
    if (omitKeys.indexOf(<K>propertyName) >= 0) {
      Reflect.deleteProperty(jsonSchema.properties, propertyName);
      if (jsonSchema.required) {
        jsonSchema.required = jsonSchema.required.filter(
          (requiredProperty) => requiredProperty !== propertyName
        );
      }
    }
  });

  class OmitClass extends Base {
    static toJSON() {
      return jsonSchema;
    }
  }

  // для каждого пропускаемого ключа добавим декораторы `Exclude` и `IsOptional`
  omitKeys.forEach((propertyName) => {
    Reflect.decorate(
      [Exclude(), IsOptional()],
      OmitClass.prototype,
      propertyName as string
    );
  });

  Reflect.decorate([NoJSONSchema()], OmitClass);

  return OmitClass;
}

export function OmitSchema<
  TBase extends ClassConstructor,
  K extends keyof C.Instance<TBase>
>(schema: TBase, omitKeys: K[] = []) {
  return createOmitSchema(schema, omitKeys);
}
