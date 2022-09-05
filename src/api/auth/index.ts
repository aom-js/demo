import Server from "api/server";
import { settings } from "./init";
import { $root } from "./root";

export const server = new Server($root, settings);
