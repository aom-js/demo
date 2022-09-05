import { prop, DocumentType } from "@typegoose/typegoose";
import CryptoJS, { AES } from "crypto-js";
import { IsBoolean, IsDate, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { EnabledModel } from "./enabled";

const secretKey: string = process.env.AUTH_SECRET_KEY;

if (!secretKey) {
  throw new Error(`AUTH_SECRET_KEY not available in process.env`);
}

export class LoginsAuthorizations extends EnabledModel {
  @prop({ required: true })
  @IsString()
  @JSONSchema({
    description: "Пароль",
    format: "password",
    readOnly: true,
  })
  secret: string;

  @prop({ index: true, default: false })
  @IsBoolean()
  @JSONSchema({
    description: "Признак одноразового пароля",
    readOnly: true,
    format: "password",
  })
  oneOff: boolean;

  @prop()
  @IsDate()
  @JSONSchema({
    description: "Время жизни пароля",
    readOnly: true,
  })
  expiredAt: Date;

  /** check if password equal for encrypted value */
  checkPassword<T extends LoginsAuthorizations>(
    this: DocumentType<T>,
    password: string
  ): boolean {
    const decrypted = AES.decrypt(this.secret, secretKey);
    return password === decrypted.toString(CryptoJS.enc.Utf8);
  }

  /** encrypt password with secret keys */
  static encryptPassword(password: string): string {
    return AES.encrypt(password, secretKey).toString();
  }
}
