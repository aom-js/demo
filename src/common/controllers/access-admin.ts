import _ from "lodash";
import { DocumentType } from "@typegoose/typegoose";
import { NextFunction, ErrorFunction } from "aom";
import { This, IRoute, ICursor, Route, Controller } from "aom";
import { Middleware, Marker, Err, Cursor, Next } from "aom";
import { Responses } from "aom";
import { models, schemas } from "models";
import { ACCESS_DENIED } from "common/constants";
import { AccessDenyResponse, ErrorMessage } from "common/api";
import { AccessPoint } from "common/schemas";
import { Account } from "./account";

@Controller()
export class AccessAdmin {
  model = models.Access;

  data: DocumentType<schemas.Access>[];

  permissions: DocumentType<schemas.UsersPermissions>;

  accessPoints: AccessPoint[] = [];

  async init(): Promise<void> {
    const usersAccessId = <any>[...(this.permissions?.accessId || [])];
    this.data = await this.model
      .find({ _id: { $in: usersAccessId }, enabled: true })
      .lean();
    this.data.forEach((access) => {
      this.accessPoints = _.union(this.accessPoints, access.points);
    });
  }

  checkAccess(point: AccessPoint): boolean {
    // ..
    return Boolean(
      _.find(this.accessPoints, _.pickBy(point, Boolean)) ||
        this.permissions?.isSuperAdmin
    );
  }

  @Middleware()
  static async Init(
    @This(Account) account: Account,
    @This() access: AccessAdmin,
    @Next() next: NextFunction
  ): Promise<ReturnType<NextFunction>> {
    // ..
    access.permissions = account.permissions;
    await access.init();
    return next();
  }

  @Marker(AccessAdmin.setMark)
  @Middleware()
  @Responses(AccessDenyResponse.toJSON())
  static async Required(
    @This() access: AccessAdmin,
    @Cursor() cursor: ICursor,
    @Route() route: IRoute,
    @Err(ErrorMessage) err: ErrorFunction,
    @Next() next: NextFunction
  ): Promise<ErrorResponse<ReturnType<NextFunction>>> {
    // ...
    const cursorIsEndpoint =
      cursor.constructor === route.constructor &&
      cursor.property === route.property &&
      cursor.handler === route.handler;

    const { prefix, method, path } = <AccessPoint>(
      (cursorIsEndpoint ? route : cursor)
    );

    return access.checkAccess({ prefix, method, path })
      ? next()
      : err(ACCESS_DENIED, 403);
  }

  static markName = "AccessAdminControl";

  static setMark(route: IRoute, cursor: ICursor): void {
    if (!route[this.markName]) {
      route[this.markName] = [];
    }

    const controlForEndpoint =
      cursor.origin.constructor === route.constructor &&
      cursor.origin.property === route.property;

    const { prefix, method, path } = <AccessPoint>(
      (controlForEndpoint ? route : cursor)
    );

    route[this.markName].push({ prefix, method, path });
  }

  static toString(): string {
    return this.name;
  }
  // */
}
