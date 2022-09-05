import { koaSwagger } from "koa2-swagger-ui";
import { Responses, This, IRoute, Use, ComponentSchema, Endpoint } from "aom";
import { Summary, Controller, Get, OpenApi } from "aom";
import { getDisplayName } from "aom/lib/special/display-name";
import { IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { BasicAuth } from "./basic-auth";
import { Logger } from "./logger";

if (!process.env.SERVER_IP) {
  throw new Error("process.env.SERVER_IP required");
}
@ComponentSchema()
export class RouteElement {
  @IsString()
  @JSONSchema({ description: "HTTP метод" })
  method: string;

  @IsString()
  @JSONSchema({ description: "Путь" })
  path: string;

  @IsString()
  @JSONSchema({ description: "ID действия" })
  operationId: string;
}

@Controller()
@Use(Logger.Init)
export class RootRoute {
  static docsJSON;

  docs: OpenApi;

  routes!: IRoute[];

  url!: string;

  static current_build;

  static server_ip = process.env.SERVER_IP;

  @Get()
  @Endpoint()
  @Summary("Список маршрутов")
  @Responses({
    status: 200,
    description: "Список маршрутов",
    isArray: true,
    schema: RouteElement,
  })
  static Index(@This() { routes }: RootRoute): IRoute[] {
    const result = [];
    routes.forEach((route) => {
      const operationId = getDisplayName(route.constructor, route.property);
      result.push(Object.assign(route, { operationId }));
    });
    return result;
  }

  @Get("/docs.json")
  @Use(BasicAuth.Required)
  @Summary("OpenApi JSON schema")
  @Responses({
    status: 200,
    description: "Документация OpenAPI",
    schema: { type: "string" },
  })
  static JSONDocs(@This() { docs }: RootRoute) {
    // сохраним документацию в контексте класса, чтобы не генерировать ее заново при повторных вызовах
    if (!this.docsJSON) {
      this.docsJSON = docs.toJSON();
    }
    return this.docsJSON;
  }

  @Get("/swagger.html")
  @Use(BasicAuth.Required)
  @Summary("OpenAPI Swagger UI")
  @Responses({
    status: 200,
    description: "Интерфейс для работы с документацией",
    schema: { type: "string" },
  })
  static Swagger(@This() { docs }: RootRoute, { ctx, next }): string {
    const swagger = koaSwagger({
      routePrefix: false,
      swaggerOptions: {
        spec: docs.toJSON(),
      },
    });
    return swagger(ctx, next) && ctx.body;
  }
}
