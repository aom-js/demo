/* eslint-disable import/no-cycle */
import _ from "lodash";
import fs from "fs-extra";
import mime from "mime";
import got from "got";
import { logger } from "config";
import { Promise } from "bluebird";
import { ComponentSchema } from "aom";
import path from "path";
import sharp from "sharp";
import { BaseModel } from "common/schemas";
import { prop, DocumentType, pre } from "@typegoose/typegoose";
import { ReturnModelType } from "@typegoose/typegoose";
import { IsBoolean, IsEnum, IsMongoId } from "class-validator";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { AspectRatios, FilesRelations } from "common/types";
import { Types } from "mongoose";

import { Users } from "./Users/Users";

const { FILES_DIR, TMP_DIR } = process.env;

@ComponentSchema()
@JSONSchema({ description: "Файлы" })
export class Files extends BaseModel {
  @IsString()
  @JSONSchema({ readOnly: true, description: "Имя файла" })
  @prop()
  name: string;

  @IsString()
  @JSONSchema({ readOnly: true, description: "Адрес файла" })
  @prop()
  path: string;

  @IsString()
  @JSONSchema({ readOnly: true, description: "Тип файла" })
  @prop()
  type: string;

  @IsNumber()
  @JSONSchema({ readOnly: true, description: "Размер файла" })
  @prop()
  size: number;

  @IsString()
  @IsOptional()
  @JSONSchema({ readOnly: true, description: "Местонахождение файла" })
  @prop()
  location?: string;

  @IsBoolean()
  @IsOptional()
  @JSONSchema({
    readOnly: true,
    description: "Признак хранения в S3 хранилище",
  })
  @prop({ default: false })
  s3: boolean;

  @IsEnum(FilesRelations)
  @IsOptional()
  @JSONSchema({
    readOnly: true,
    description: "Вид отношения к другому файлу",
  })
  @prop({ index: true })
  relationType: FilesRelations;

  @prop({ index: true })
  @IsString()
  @IsOptional()
  @JSONSchema({
    readOnly: true,
    description: "Параметры для расчета отношения",
  })
  relationParams: string;

  @prop({ index: true, ref: () => Files })
  @IsMongoId()
  @IsOptional()
  @JSONSchema({
    readOnly: true,
    description: "Отношение к другому файлу",
  })
  relationId: Types.ObjectId;

  @prop({ index: true, ref: () => Users })
  @IsMongoId()
  @IsOptional()
  @JSONSchema({
    readOnly: true,
    description: "Создатель файла",
  })
  userId: Types.ObjectId;

  static async getPreview(
    this: ReturnModelType<typeof Files>,
    fileId: Types.ObjectId
  ): Promise<DocumentType<Files>> {
    fileId = new Types.ObjectId(String(fileId));
    const file = await this.findById(fileId);

    const { _id } = file;
    const relation = {
      relationId: _id,
      relationType: FilesRelations.Preview,
    };
    const existsPreview = await this.findOne(relation);
    // если файл был найден, то вернем его
    if (existsPreview) {
      return existsPreview;
    }
    // иначе создадим новую превью высотой в 200 пикселей
    const name = [relation.relationType, file.name].join("-");
    const validFilePath = file.s3
      ? await file.downloadTmpFile()
      : file.location;
    // создадим новый документ, в котором оригинальным адресом будет исходная картинка
    const previewFile = new this({
      ...relation,
      type: file.type,
      name,
      path: validFilePath,
    });
    previewFile.location = path.join(
      FILES_DIR,
      [previewFile._id, previewFile.name].join("-")
    );

    // сделаем ей ресайз и сохраним в нужной локации
    const { size } = await sharp(previewFile.path)
      .resize(null, 200)
      .toFile(previewFile.location);
    // сохраним размер и файл
    Object.assign(previewFile, { size });
    await previewFile.save();
    // и вернем его
    return previewFile;
  }

  static async getJPG(
    this: ReturnModelType<typeof Files>,
    fileId: Types.ObjectId
  ): Promise<DocumentType<Files>> {
    fileId = new Types.ObjectId(String(fileId));
    const file = await this.findById(fileId);
    const { _id } = file;
    const relation = {
      relationId: _id,
      relationType: FilesRelations.JPG,
    };
    const existsJPG = await this.findOne(relation);
    // если файл был найден, то вернем его
    if (existsJPG) {
      return existsJPG;
    }
    // иначе создадим новую превью высотой в 200 пикселей
    const name = [file.name, relation.relationType].join(".");
    const validFilePath = file.s3
      ? await file.downloadTmpFile()
      : file.location;

    // создадим новый документ, в котором оригинальным адресом будет исходная картинка
    const JPGFile = new this({
      ...relation,
      name,
      type: mime.getType(name),
      path: validFilePath,
    });
    JPGFile.location = path.join(
      FILES_DIR,
      [JPGFile._id, JPGFile.name].join("-")
    );
    // сделаем ей ресайз и сохраним в нужной локации
    const { size } = await sharp(JPGFile.path)
      .jpeg({ quality: 100 })
      .toFile(JPGFile.location);
    // сохраним размер и файл
    Object.assign(JPGFile, { size });
    await JPGFile.save();
    // и вернем его
    return JPGFile;
  }

  static async getAspectRatioCrop(
    this: ReturnModelType<typeof Files>,
    fileId: Types.ObjectId,
    aspectRatio: AspectRatios,
    maxWidth?: number
  ): Promise<DocumentType<Files>> {
    fileId = new Types.ObjectId(String(fileId));
    const file = await this.findById(fileId);
    const { _id } = file;
    const relation = {
      relationId: _id,
      relationType: FilesRelations.Crop,
      relationParams: [aspectRatio, +maxWidth].filter(Boolean).join(","),
    };

    const existsCrop = await this.findOne(relation);
    // если файл был найден, то вернем его
    if (existsCrop) {
      return existsCrop;
    }
    // иначе создадим новую превью высотой в 200 пикселей
    const name = [
      relation.relationType,
      relation.relationParams,
      file.name,
    ].join("-");

    const validFilePath = file.s3
      ? await file.downloadTmpFile()
      : file.location;

    // создадим новый документ, в котором оригинальным адресом будет исходная картинка
    const croppedFile = new this({
      ...relation,
      type: file.type,
      name,
      path: validFilePath,
    });
    croppedFile.location = path.join(
      FILES_DIR,
      [croppedFile._id, croppedFile.name].join("-")
    );
    const sharpImage = sharp(croppedFile.path);
    const { width, height } = await sharpImage.metadata();
    // для обрезки изображения необходимо использовать метод `extract`, который подразумевает передачу 4х значений
    // left - сдвиг от левого края, width - ширину обрезки
    // top - сдвиг от верха, height - высоту обрезки
    // таким образом в зависимости от пропорции, необходимо расчитать значения, на которые будет произведена обрезка
    // в первую очередь, необходимо понять коэффициент пропорции
    // для этого разобьем значение `aspectRatio` по разделителю, и разделим левую часть на правую
    const [k1, k2] = aspectRatio.split(":").map(Number);
    const koef = k1 / k2;
    // методом взаимосключающих проверок быстро найдем, что на что надо разделить и умножить, чтобы добиться нужного результат
    // по умолчанию возьмем в качестве ширины обрезки ширину картинки
    // и разделим ее на коэффициент
    let cropWidth = +width;
    let cropHeight = Math.floor(cropWidth / koef);
    // если полученная высота больше высоты оригинальной картинки
    // то поменяем пропорции
    if (cropHeight > height) {
      cropHeight = +height;
      cropWidth = Math.floor(height * koef);
    }
    // теперь расчитаем двиг слева и сверху для корректного расчета
    // для этого следует использовать разницу между оригинальным и расчетным значением, поделенным на 2
    const left = Math.floor((width - cropWidth) / 2);
    const top = Math.floor((height - cropHeight) / 2);
    // console.log(sharpImage, { width, height, cropWidth, cropHeight });
    // сделаем ей ресайз и сохраним в нужной локации
    const { size } = await sharpImage
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .resize(cropWidth > maxWidth ? maxWidth : null, null)
      .toFile(croppedFile.location);
    // сохраним размер и файл
    Object.assign(croppedFile, { size });
    await croppedFile.save();
    // и вернем его
    return croppedFile;
  }

  async ensure(this: DocumentType<Files>): Promise<DocumentType<Files>> {
    this.location = path.join(FILES_DIR, [this._id, this.name].join("-"));
    // проверим, чтобы это была картинка, и при необходимости поправим ей ориентацию
    const mimeType = mime.getType(this.name);
    this.type = mimeType || "application/octet-stream";
    if (mimeType.search("image/") >= 0 && mimeType !== "image/svg+xml") {
      const { size } = await sharp(this.path).rotate().toFile(this.location);
      Object.assign(this, { size });
    } else {
      fs.renameSync(this.path, this.location);
    }
    // тут следует сделать фиксацию ориентации фотографии
    await this.save();

    return this;
  }

  async downloadTmpFile(this: DocumentType<Files>): Promise<string> {
    const tmpName = path.join(
      TMP_DIR,
      `${Date.now()}_${decodeURIComponent(path.basename(this.location))}`
    );
    const tmpStream = fs.createWriteStream(tmpName);
    return new Promise((resolve, reject) => {
      got.stream(this.location).pipe(tmpStream);
      tmpStream.on("finish", resolve);
      tmpStream.on("error", reject);
      return tmpName;
    })
      .then(() => {
        tmpStream.close();
        return tmpName;
      })
      .catch((e) => {
        tmpStream.close();
        logger.error("download file error", e);
        throw e;
      });
  }

  static async upload(
    this: ReturnModelType<typeof Files>,
    file: File,
    userId: Types.ObjectId
  ): Promise<DocumentType<Files>> {
    return new this({ ...file, userId }).ensure();
  }
}
