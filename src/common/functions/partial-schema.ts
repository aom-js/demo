import { getMetadataStorage, IsOptional } from "class-validator";
import { ClassConstructor } from "aom/lib/common/declares";

function createPartialSchema<TBase extends ClassConstructor>(Base: TBase) {
  class PartialClass extends Base {}
  // извлечем все метаданные для исходного класса
  const storage = getMetadataStorage();
  const metaByProperties = storage.groupByPropertyName(
    storage.getTargetValidationMetadatas(Base, "", true, false)
  );
  // для каждого свойства созданного класса вызовем декоратор `IsOptional`
  Object.keys(metaByProperties).forEach((propertyName) => {
    Reflect.apply(IsOptional(), null, [PartialClass.prototype, propertyName]);
  });

  return PartialClass;
}

export function PartialSchema<T extends ClassConstructor>(schema: T) {
  return createPartialSchema(schema);
}
