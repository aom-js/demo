import { Ctx, Middleware, Next, NextFunction, UseSecurity } from "aom";
import { AddSecurity, Controller, Err, ErrorFunction, Headers } from "aom";
import { Context } from "koa";
import { ErrorMessage } from "../api";
import { AUTH_REQUIRED } from "../constants";

export const BasicSecuritySchema = {
  type: "http",
  scheme: "basic",
};

const { BASIC_AUTH } = process.env;

@Controller()
@AddSecurity(BasicSecuritySchema)
export class BasicAuth {
  @Middleware()
  @UseSecurity(BasicAuth)
  static async Required(
    @Ctx() ctx: Context,
    @Headers() { authorization },
    @Err(ErrorMessage) err: ErrorFunction,
    @Next() next: NextFunction
  ) {
    const [, basic] = String(authorization).split(" ");
    if (!BASIC_AUTH || basic === Buffer.from(BASIC_AUTH).toString("base64")) {
      return next();
    }
    ctx.set("WWW-Authenticate", "Basic");
    return err(AUTH_REQUIRED, 401);
    ///
  }
}
