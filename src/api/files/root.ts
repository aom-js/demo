import { $, Bridge, Controller, Post, Files as CtxFiles } from "aom";
import { RequestBody, Responses, Summary, Use, This } from "aom";
import { Promise } from "bluebird";
import models, { schemas } from "models";
import { Auth, RootRoute } from "common/controllers";
import { ErrorMessage } from "common/api";
import Docs from "./docs";
import { url } from "./init";
import { File } from "./file";

@Bridge(`/file_${File}`, File)
@Controller()
class Root extends RootRoute {
  routes = $aom.routes;

  docs = Docs;

  url = url;

  @Post("/")
  @Summary("Загрузить файл")
  @Use(Auth.Required)
  @Responses(
    {
      status: 200,
      schema: schemas.Files,
      isArray: true,
      description: "Список загруженных файлов",
    },
    ErrorMessage.toJSON("Ошибка загрузки файла")
  )
  @RequestBody({
    description: "file form",
    contentType: "multipart/form-data",
    schema: {
      properties: {
        file: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
  })
  // */
  static async upload(
    @This(Auth) { account }: Auth,
    @CtxFiles() files: Record<string, File | File[]>
  ): Promise<schemas.Files[]> {
    const filesList = [];
    const { _id: userId } = account;
    const result = [];
    Object.values(files).forEach((fileData: File | File[]) => {
      if (fileData instanceof Array) {
        fileData.forEach((file: File) => {
          filesList.push(file);
        });
      } else {
        filesList.push(fileData);
      }
      // ...
    });
    await Promise.map(filesList, async (file) =>
      result.push(await models.Files.upload(file, userId))
    );
    return result;
  }
}

export const $aom = new $(Root).docs(Docs);
