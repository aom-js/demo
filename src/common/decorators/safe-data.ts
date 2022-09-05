import { Body, Query } from "aom";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { WRONG_DATA_ERROR } from "common/constants";
import { WrongDataResponse } from "../api/error-responses";

export function SafeBody<T extends ClassConstructor<unknown>>(
  constructor: T
): ParameterDecorator {
  return Body(SafeData(constructor));
}

export function SafeQuery<T extends ClassConstructor<unknown>>(
  constructor: T
): ParameterDecorator {
  return Query(SafeData(constructor));
}

// fabric for safe body processing
// generate function for argument in `@Body` decorator
export function SafeData<T extends ClassConstructor<unknown>>(
  constructor: T
  // eslint-disable-next-line @typescript-eslint/ban-types
): Function {
  const handler = async (body) => {
    const safeAttrs = plainToInstance(
      constructor,
      { ...body },
      {
        exposeDefaultValues: true,
        strategy: "excludeAll",
        exposeUnsetFields: false,
        enableCircularCheck: true,
      }
    ) as T;

    const valueErrors = await validate(safeAttrs, {
      whitelist: true,
    });

    if (valueErrors.length) {
      // возвращает код 400, если форма не прошла проверку
      throw new WrongDataResponse(
        WRONG_DATA_ERROR,
        WrongDataResponse.status,
        valueErrors
      );
    }
    return safeAttrs;
  };
  return handler;
}
