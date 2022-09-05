import { $, Bridge, Controller } from "aom";
import { Auth, RootRoute } from "common/controllers";
import Docs from "./docs";
import { url } from "./init";
import Routes from "./routes";

@Bridge("/", Routes)
@Controller()
class Root extends RootRoute {
  routes = $root.routes;

  docs = Docs;

  url = url;
}

export const $root = new $(Root).docs(Docs);

// export default new $aom(Root).docs(Docs);
