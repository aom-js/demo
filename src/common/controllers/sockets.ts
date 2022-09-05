/* eslint-disable @typescript-eslint/ban-types */
import _ from "lodash";
import { Args, Controller, IRoute, Middleware, Params, This } from "aom";
import { Headers, Next, Route } from "aom";
import { Constructor } from "aom/lib/common/declares";
import { Account } from "./account";

export declare type SocketConnections = Map<string, WebSocket[]>;
export declare type WithSockets<T extends {}> = T & {
  sockets: Sockets;
  socketsParam?: string | Function;
};
export declare type CtxWS = () => WebSocket;

export class Sockets {
  connections: SocketConnections;

  listener: Function;

  constructor() {
    this.connections = new Map();
  }

  server() {
    this.listener();
    return this;
  }

  send(_id: any, data: any): void {
    const sockets = this.connections.get(_id) || [];
    sockets.forEach((socket: WebSocket) => {
      socket.send(data);
    });
  }

  broadcast(data: any): void {
    this.connections.forEach((sockets, _id) => this.send(_id, data));
    // [...this.connections.keys()].forEach((_id) => this.send(_id, data));
  }

  connect(_id: string, socket: WebSocket): Sockets {
    const sockets = this.connections.get(_id) || [];
    this.connections.set(_id, sockets.concat([socket]));
    return this;
  }

  disconnect(_id: string, socket: WebSocket): Sockets {
    const sockets = this.connections.get(_id) || [];
    this.connections.set(
      _id,
      sockets.filter((_) => _ !== socket)
    );
    return this;
  }
}

export function Ws(): ParameterDecorator {
  const handler = ({ ctx }) => {
    return ctx.ws;
  };
  return Args(handler);
}

@Controller()
export class WebSockets {
  @Middleware()
  static async Init(
    @Ws() ws: CtxWS,
    @This(Account) { userId }: Account,
    @Next() next,
    @Route() route: IRoute
  ) {
    const constructor = route.constructor as WithSockets<Constructor>;
    if (!constructor.sockets || !(constructor.sockets instanceof Sockets)) {
      throw new Error("wrong target sockets definition");
    }
    if (ws) {
      const socket: WebSocket = await ws();
      const id = String(userId);
      // console.log(socket);
      if (id) {
        constructor.sockets.connect(id, socket);
        socket.onopen = (ev: Event) => {
          console.log("socket opened", ev);
        };
        socket.onmessage = (ev: MessageEvent) => {
          console.info(ev.data);
        };
        socket.onclose = (ev: CloseEvent) => {
          console.log("socket closed");
          constructor.sockets.disconnect(id, socket);
        };
      }
      return null;
    } else {
      return next();
    }
  }

  @Middleware()
  static async Param(
    @Ws() ws: CtxWS,
    @Params() params: any,
    @This(Account) { userId }: Account,
    @Headers() headers: any,
    @Next() next,
    @Route() route: IRoute
  ) {
    const constructor = route.constructor as WithSockets<Constructor>;
    if (!constructor.sockets || !(constructor.sockets instanceof Sockets)) {
      throw new Error("wrong target sockets definition");
    }
    if (ws) {
      const socket: WebSocket = await ws();
      const paramName = _.isString(constructor.socketsParam)
        ? constructor.socketsParam
        : Reflect.apply(constructor.socketsParam, null, []);
      const id = Reflect.get(params, paramName);

      if (id) {
        constructor.sockets.connect(id, socket);
        socket.onopen = (ev: Event) => {
          console.log("socket opened", ev);
        };
        socket.onmessage = (ev: MessageEvent) => {
          console.info(ev.data);
        };
        socket.onclose = (ev: CloseEvent) => {
          console.log("socket closed");
          constructor.sockets.disconnect(id, socket);
        };
      }
      return null;
    } else {
      return next();
    }
  }
}

export default new Sockets();
