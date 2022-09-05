import moment from "moment";
import { Transform } from "class-transformer";

export function TransformToDate(): PropertyDecorator {
  return (constructor, property) => {
    return Reflect.decorate(
      [Transform(({ value }) => value && moment(value).toDate())],
      constructor,
      property
    );
  };
}
