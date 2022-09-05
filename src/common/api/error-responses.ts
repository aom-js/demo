import { ERROR_WRONG_DATA } from "common/constants";
import { ERROR_CONFLICT, ERROR_NOT_FOUND } from "common/constants";
import { ERROR_ACCESS_DENY, ERROR_AUTH_REQUIRED } from "common/constants";
import { ErrorMessage } from "./error-message";

export class NotFoundResponse extends ErrorMessage {
  static status = 404;

  static description = ERROR_NOT_FOUND;
}

export class ConflictResponse extends ErrorMessage {
  static status = 409;

  static description = ERROR_CONFLICT;
}

export class WrongDataResponse extends ErrorMessage {
  static status = 400;

  static description = ERROR_WRONG_DATA;
}

export class AccessDenyResponse extends ErrorMessage {
  static status = 403;

  static description = ERROR_ACCESS_DENY;
}

export class AuthRequiredResponse extends ErrorMessage {
  static status = 403;

  static description = ERROR_AUTH_REQUIRED;
}
