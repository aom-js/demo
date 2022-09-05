import { Responses, Summary, This, Use } from "aom";
import { $, Bridge, Controller, Post } from "aom";
import models from "models";
import { Auth, RootRoute } from "common/controllers";
import { MessageResponse } from "common/api";
import Docs from "./docs";
import { url } from "./init";
import { LoginRoute } from "./routes";

@Bridge("/", LoginRoute)
@Controller()
class Root extends RootRoute {
  routes = $root.routes;

  docs = Docs;

  url = url;

  @Post("/logout")
  @Use(Auth.Required)
  @Summary("Завершить сессию")
  @Responses(MessageResponse.toJSON())
  static async Logout(@This(Auth) auth: Auth) {
    //
    const { _id: tokenId } = auth.token;
    await models.UsersLoginsTokens.updateOne(
      { _id: tokenId },
      { $set: { enabled: false } }
    );

    return new MessageResponse("Сессия завершена");
  }
}

export const $root = new $(Root).docs(Docs);

// export default new $aom(Root).docs(Docs);
