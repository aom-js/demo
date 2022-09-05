import { Expose } from "class-transformer";
import { IsString, MinLength } from "class-validator";

export class Passwords {
  @IsString()
  @Expose()
  @MinLength(8)
  password: string;

  @IsString()
  @Expose()
  @MinLength(8)
  passwordConfirm: string;
}
