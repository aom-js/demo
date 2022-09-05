import { OpenApiResponse } from "aom";
import { IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";

export class CommonResponse {
  static status = 200;

  static description: string;

  static toJSON(description?: string | string[]): OpenApiResponse {
    return {
      status: this.status,
      schema: this,
      isArray: Array.isArray(description),
      description: description ? description.toString() : "",
    };
  }
}

export class MessageResponse extends CommonResponse {
  static description = "Типовое сообщение";

  @IsString()
  @IsOptional()
  @JSONSchema({ description: "Сообщение" })
  message?: string;

  constructor(message?: string) {
    super();
    if (message) this.message = message;
  }
}

export class DataResponse extends MessageResponse {
  static description = "Сообщение с данными";

  @IsObject()
  @IsOptional()
  @JSONSchema({ description: "Данные" })
  data?: any;

  constructor(message?: string, data?: any) {
    super(message);
    if (data) this.data = data;
  }
}

export class TotalDataResponse extends DataResponse {
  @IsNumber()
  @IsOptional()
  @JSONSchema({ description: "Общее количество данных" })
  total?: number;
}
