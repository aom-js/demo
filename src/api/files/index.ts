import Server from "api/server";
import { $aom } from "./root";

import { settings } from "./init";

export const server = new Server($aom, settings);
