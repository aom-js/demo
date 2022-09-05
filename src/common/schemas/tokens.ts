import CryptoJS from "crypto-js";
import { prop, DocumentType } from "@typegoose/typegoose";
import { IsDate, IsEnum, IsString } from "class-validator";
import { TokenTypes } from "common/types";
import { JSONSchema } from "class-validator-jsonschema";
import { EnabledModel } from "./enabled";

export class LoginsTokens extends EnabledModel {
  @IsString()
  @prop({ required: true, index: true })
  @JSONSchema({
    description: "Токен доступа",
    example: CryptoJS.lib.WordArray.random(64).toString(),
    readOnly: true,
  })
  accessToken: string;

  @IsString()
  @JSONSchema({
    description: "Токен обновления",
    example: CryptoJS.lib.WordArray.random(64).toString(),
    readOnly: true,
  })
  @prop({ required: true })
  refreshToken: string;

  @IsEnum(TokenTypes)
  @prop({ required: true, index: true })
  @JSONSchema({
    description: "Тип токена",
    example: TokenTypes.Bearer,
    readOnly: true,
  })
  type: TokenTypes;

  @IsDate()
  @prop()
  @JSONSchema({
    description: "Дата истечения токена",
    example: new Date(),
    readOnly: true,
  })
  expiredAt: Date;

  async generateTokenData<T extends LoginsTokens>(
    this: DocumentType<T>,
    lifetime: number = null
  ): Promise<DocumentType<T>> {
    const accessToken = CryptoJS.lib.WordArray.random(128).toString();
    const refreshToken = CryptoJS.lib.WordArray.random(128).toString();
    const type = TokenTypes.Bearer;
    Object.assign(this, { accessToken, refreshToken, type });
    // установим время жизни
    if (lifetime) {
      this.expiredAt = new Date(Date.now() + lifetime * 1000);
    }
    await this.save();
    return this;
  }
}
