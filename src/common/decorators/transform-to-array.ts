import _ from "lodash";
import { Transform } from "class-transformer";

export function TransformToArray(): PropertyDecorator {
  return (constructor, property) => {
    return Reflect.decorate(
      [Transform(({ value }) => _.split(value, ",").filter(_.size))],
      constructor,
      property
    );
  };
}
