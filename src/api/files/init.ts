import { Expose, Transform } from "class-transformer";
import { IsEnum, IsNumber, IsOptional } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { QueryFilter } from "common/api";
import { AspectRatios } from "common/types";

const { FILES_API_HOST, FILES_API_PORT } = process.env;

if (!(FILES_API_HOST && FILES_API_PORT)) {
  throw new Error(".env variables required: FILES_API_HOST, FILES_API_PORT");
}

export const url = FILES_API_HOST;

export const settings = {
  url,
  port: +FILES_API_PORT,
  env: { FILES_API_HOST, FILES_API_PORT },
};

export class AspectRatioWidthQuery extends QueryFilter {
  @IsEnum(AspectRatios)
  @Expose()
  @JSONSchema({ description: "Пропорции обрезки" })
  ratio: AspectRatios;

  @IsNumber()
  @Expose()
  @IsOptional()
  @Transform(({ value }) => +value)
  @JSONSchema({ description: "Максимальная ширина" })
  maxWidth?: number;
}
