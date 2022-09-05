import { C } from "ts-toolbelt";
import _ from "lodash";
import { FilterQuery } from "mongoose";
import { AdditionalConverter } from "aom";
import { ValidatorConstraint, ValidationArguments } from "class-validator";
import { ValidatorConstraintInterface, Validate } from "class-validator";
import { ERROR_NOT_EXISTS } from "common/constants";
import { BaseModel } from "common/schemas/base";
import { getModelForClass, ReturnModelType } from "@typegoose/typegoose";

@ValidatorConstraint({ async: true })
@AdditionalConverter({})
export class CheckExistsValidator implements ValidatorConstraintInterface {
  async validate(
    Ids: string | string[],
    validationArguments: ValidationArguments
  ) {
    const { constraints } = validationArguments;
    const [model, ...rest] = constraints;
    Ids = _.flatten([Ids]);
    const existsFilesCount = await model.countDocuments({
      _id: { $in: Ids },
      ...rest[0],
    });
    return Ids.length === existsFilesCount;
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return ERROR_NOT_EXISTS;
  }
}

export function CheckExists<
  T extends typeof BaseModel,
  F = FilterQuery<C.Instance<T>>
>(schema: () => T, where?: F): PropertyDecorator {
  return (constructor, property) => {
    return Reflect.decorate(
      [
        Validate(CheckExistsValidator, [getModelForClass(schema()), where], {
          message: ERROR_NOT_EXISTS,
        }),
      ],
      constructor,
      property
    );
  };
}

export function CheckExistsSchema<
  T extends typeof BaseModel,
  F = FilterQuery<C.Instance<T>>
>(schema: T, where?: F): PropertyDecorator {
  return (constructor, property) => {
    return Reflect.decorate(
      [
        Validate(CheckExistsValidator, [getModelForClass(schema), where], {
          message: ERROR_NOT_EXISTS,
        }),
      ],
      constructor,
      property
    );
  };
}
export function CheckExistsModel<
  T extends typeof BaseModel,
  D = ReturnModelType<T>,
  F = FilterQuery<C.Instance<T>>
>(model: D, where?: F): PropertyDecorator {
  return (constructor, property) => {
    return Reflect.decorate(
      [
        Validate(CheckExistsValidator, [model, where], {
          message: ERROR_NOT_EXISTS,
        }),
      ],
      constructor,
      property
    );
  };
}
