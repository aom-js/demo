import { Get, This, ThisRef, Controller } from "aom";
import { Post, Use } from "aom";
import { CombineSchemas, RequestBody, Responses, Summary } from "aom";
import { TotalDataResponse } from "common/api";
import { LoginType } from "./types";
import { LoginsInitBase } from "./init";

export { LoginInfoBase } from "./login";

export const LoginsSchema = ThisRef(
  <T extends typeof LoginsListBase>({ loginsSchema }: T) => loginsSchema
);

const LoginsData = ThisRef(
  <T extends typeof LoginsListBase>({ loginsSchema }: T) =>
    CombineSchemas(TotalDataResponse, { data: loginsSchema })
);

@Controller()
export class LoginsListBase extends LoginsInitBase {
  @Get()
  @Summary("Список логинов")
  @Responses({
    status: 200,
    description: "Список логинов",
    isArray: true,
    schema: LoginsData,
  })
  static async Index(
    @This() { account }: LoginsListBase
  ): Promise<TotalDataResponse> {
    const loginsModel = this.loginsSchema.getModel();
    const where = { [this.accountId]: account._id };
    const response = new TotalDataResponse();
    response.total = await loginsModel.countDocuments(where);
    response.data = await loginsModel.find(where);
    return response;
  }

  @Post()
  @Summary("Добавить логин")
  @Responses({
    status: 200,
    description: "Информация о логине",
    schema: LoginsSchema,
  })
  @RequestBody({
    description: "Логин",
    schema: LoginsSchema,
  })
  @Use(LoginsListBase.CheckLogin)
  static async Add(
    @This() { validLogin, account }: LoginsListBase
  ): Promise<ErrorResponse<LoginType>> {
    const accountId = { [this.accountId]: account._id };
    const loginsModel = this.loginsSchema.getModel();
    return loginsModel.create({ ...validLogin, ...accountId });
  }
}
