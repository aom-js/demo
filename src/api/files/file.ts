import { Context } from "koa";
import models, { controllers, schemas } from "models";
import fs from "fs";
import { ErrorFunction, QueryParameters } from "aom";
import { Controller, Get, This, Ctx, UseNext, Endpoint, Err } from "aom";
import { Responses, Summary, Middleware, Next, NextFunction, Use } from "aom";
import { ErrorMessage, NotFoundResponse } from "common/api";
import { SafeQuery } from "common/decorators";
import { AspectRatioWidthQuery } from "./init";

@Controller()
@Use(File.PathID, File.Install)
export class File extends controllers.Files.document("fileId") {
  @Middleware()
  @Responses(NotFoundResponse.toJSON())
  static async Install(
    @Ctx() ctx: Context,
    @Next() next: NextFunction,
    @Err(ErrorMessage) err: ErrorFunction
  ): Promise<ErrorResponse<ReturnType<NextFunction>>> {
    ctx.set("Access-Control-Allow-Origin", "*");
    return next();
  }

  @Get("/")
  @Summary("Информация о файле")
  @Responses({
    description: "Информация о файле",
    status: 200,
    schema: schemas.Files,
  })
  static Info(@This() { document }: File) {
    return document;
  }

  @Endpoint()
  @Get("/download")
  @Summary("Скачать файл")
  @Use(File.CheckS3)
  static Download(@Ctx() ctx: Context, @This() { document }: File) {
    ctx.set(
      "Content-disposition",
      `attachment;filename*=UTF-8''${encodeURIComponent(document.name)}`
    );
    return fs.createReadStream(document.location);
  }

  @Endpoint()
  @Get("/stream")
  @Summary("Получить файл")
  @Use(File.CheckS3)
  static Stream(@Ctx() ctx: Context, @This() { document }: File) {
    // ..
    ctx.set(
      "Content-disposition",
      `inline;filename*=UTF-8''${encodeURIComponent(document.name)}`
    );

    return fs.createReadStream(document.location);
  }

  @Get("/preview")
  @Summary("Получить превью")
  @Use(File.IsSVG)
  @UseNext(File.Stream)
  static async Preview(@Next() next: NextFunction, @This() file: File) {
    // ..
    // file.entity = await file.entity.getPreview();
    file.document = await models.Files.getPreview(file._id);
    return next();
  }

  @Get("/crop")
  @Use(File.IsSVG)
  @QueryParameters(...AspectRatioWidthQuery.toJSON())
  @Summary("Получить обрезку в заданных пропорциях")
  @UseNext(File.Stream)
  static async Crop(
    @Next() next: NextFunction,
    @SafeQuery(AspectRatioWidthQuery) query: AspectRatioWidthQuery,
    @This() file: File
  ) {
    const { ratio, maxWidth } = query;
    // ..
    // file.entity = await file.entity.getPreview();
    file.document = await models.Files.getAspectRatioCrop(
      file._id,
      ratio,
      maxWidth
    );
    return next();
  }

  @Get("/image.jpg")
  @Use(File.IsSVG)
  @Summary("Получить JPG файла")
  @UseNext(File.Stream)
  static async JPG(@Next() next: NextFunction, @This() file: File) {
    // ..
    // file.entity = await file.entity.getJPG();
    file.document = await models.Files.getJPG(file._id);
    return next();
  }

  @Middleware()
  static async CheckS3(
    @Next() next: NextFunction,
    @Ctx() ctx: Context,
    @This() { document }: File
  ) {
    if (document.s3) {
      ctx.redirect(document.location);
      return true;
    }
    return next();
  }

  @Middleware()
  static async IsSVG(
    @Next() next: NextFunction,
    @Ctx() ctx: Context,
    @This() { document }: File
  ) {
    // если тип файла svg, то вернем его как есть
    if (document.type === "image/svg+xml") {
      return next(this.CheckS3, this.Stream);
    }
    return next();
  }
}
