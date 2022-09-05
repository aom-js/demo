/* eslint-disable import/no-cycle */
import _ from "lodash";
import { models } from "models";
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from "class-validator";
import { AdditionalConverter } from "aom";

@ValidatorConstraint({ async: true })
@AdditionalConverter({})
export class CheckExistsFilesValidator implements ValidatorConstraintInterface {
  async validate(
    filesId: string | string[],
    validationArguments: ValidationArguments
  ) {
    const { constraints } = validationArguments;
    filesId = _.flatten([filesId]);
    const existsFilesCount = await models.Files.countDocuments({
      _id: { $in: filesId },
      ...constraints[0],
    });
    return filesId.length === existsFilesCount;
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return "Указанные файлы не существуют или не валидны!";
  }
}

export function CheckExistsImages(): PropertyDecorator {
  return (constructor, property) => {
    return Reflect.decorate(
      [
        Validate(
          CheckExistsFilesValidator,
          [{ type: /^image\//, relationType: null }],
          {
            message: "Указанные файлы не являются изображениями",
          }
        ),
      ],
      constructor,
      property
    );
  };
}

export function CheckExistsFiles(): PropertyDecorator {
  return (constructor, property) => {
    return Reflect.decorate(
      [
        Validate(CheckExistsFilesValidator, [{ relationType: null }], {
          message: "Указанные файлы не сушествуют или не валидны",
        }),
      ],
      constructor,
      property
    );
  };
}
