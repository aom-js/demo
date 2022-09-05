import xss from "xss";
import { Transform } from "class-transformer";

export function Sanitize(): PropertyDecorator {
  //
  return (constructor, property) => {
    return Reflect.decorate(
      [
        Transform(({ value }) => {
          const sanitized = xss(value, {
            whiteList: {},
            allowCommentTag: false,
            stripIgnoreTag: true,
          });
          return sanitized;
        }),
      ],
      constructor,
      property
    );
  };
}
