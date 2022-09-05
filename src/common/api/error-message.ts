import { ComponentSchema, OpenApiResponse } from "aom";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { targetConstructorToSchema } from "class-validator-jsonschema";
import { ERROR_MESSAGE } from "common/constants";

interface IErrorData {
  message: string;
  status: number;
  data?: any;
}

@JSONSchema({
  description: "Стандартный ответ об ошибке",
})
@ComponentSchema()
export class ErrorMessage extends Error implements IErrorData {
  static status = 500;

  static description = ERROR_MESSAGE;

  @IsNumber()
  @JSONSchema({
    description: "Код ошибки",
  })
  status: number;

  @IsString()
  @JSONSchema({
    description: "Сообщение об ошибке",
  })
  message: string;

  @IsOptional()
  @JSONSchema({
    type: "object",
    description: "Детали ошибки",
  })
  data?: any;

  constructor(message: string, status?, data?) {
    super(message);
    this.status = status || (<any>this.constructor).status;
    this.data = data;
  }

  toJSON(): IErrorData {
    return {
      message: this.message,
      status: this.status,
      data: this.data,
    };
  }

  static toJSON(description?: string): OpenApiResponse {
    return {
      status: this.status,
      schema: targetConstructorToSchema(this),
      description: description || this.description,
    };
  }
}
