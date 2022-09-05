import { C } from "ts-toolbelt";
import { getMetadataStorage, IsOptional } from "class-validator";
import { Exclude, Expose } from "class-transformer";
import { ClassConstructor } from "aom/lib/common/declares";
import { NoJSONSchema, toJSONSchema } from "aom";

function createPickSchema<
  TBase extends ClassConstructor,
  K extends keyof C.Instance<TBase>
>(Base: TBase, pickKeys: K[] = []) {
  const jsonSchema = {
    type: "object",
    properties: {},
    ...toJSONSchema(Base),
  };

  Object.keys(jsonSchema.properties).forEach((propertyName) => {
    if (pickKeys.indexOf(<K>propertyName) < 0) {
      Reflect.deleteProperty(jsonSchema.properties, propertyName);
      if (jsonSchema.required) {
        jsonSchema.required = jsonSchema.required.filter(
          (requiredProperty) => requiredProperty !== propertyName
        );
      }
    }
  });

  class PickClass extends Base {
    static toJSON() {
      return jsonSchema;
    }
  }

  // извлечем все метаданные для исходного класса
  const storage = getMetadataStorage();
  const metaByProperties = storage.groupByPropertyName(
    storage.getTargetValidationMetadatas(Base, "", true, false)
  );

  // для каждого свойства, которого нет в списке вызовем декоратор `IsOptional` и `Exclude`
  Object.keys(metaByProperties).forEach((propertyName) => {
    if (pickKeys.indexOf(<K>propertyName) < 0) {
      Reflect.decorate(
        [Exclude(), IsOptional()],
        PickClass.prototype,
        propertyName
      );
    } else {
      Reflect.decorate([Expose()], PickClass.prototype, propertyName);
    }
  });

  Reflect.decorate([NoJSONSchema()], PickClass);

  return PickClass;
}

export function PickSchema<
  TBase extends ClassConstructor,
  K extends keyof C.Instance<TBase>
>(schema: TBase, pickKeys: K[] = []) {
  return createPickSchema(schema, pickKeys);
}
