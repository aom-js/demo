import _ from "lodash";
import { Transform } from "class-transformer";
import { IsBoolean } from "class-validator";

export function QueryBoolean(): PropertyDecorator {
  return (constructor, property) => {
    return Reflect.decorate(
      [
        IsBoolean(),
        Transform(({ value }) => {
          // сопоставим со строковым значением
          const isTrue = value === "true";
          const isFalse = value === "false";
          if (isTrue) return true;
          if (isFalse) return false;
          return _.isBoolean(value) ? value : Boolean(+value);
        }),
      ],
      constructor,
      property
    );
  };
}
