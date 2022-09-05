import { AddTag, Bridge, Controller, Middleware } from "aom";
import { MergeNextTags, Next, NextFunction, Use, UseTag } from "aom";
import { AccessAdmin } from "common/controllers";
import { Countries } from "./countries";
import { Currencies } from "./currencies";
import { Marketplaces } from "./marketplaces";

@Controller()
@AddTag("Справочники")
@Bridge("/countries", Countries)
@Bridge("/currencies", Currencies)
@Bridge("/marketplaces", Marketplaces)
@Use(References.Tag, AccessAdmin.Required)
export class References {
  @Middleware()
  @UseTag(References)
  @MergeNextTags()
  static Tag(@Next() next: NextFunction) {
    return next();
  }
}
