import { Socket } from "socket.io";

export type User = {
  /** @deprecated */
  userId: string;
  username?: string;
};

export type MessageClient = User & {
  socket: Socket<any, any, any, any>;
};

export type Message = User & {
  command?:
    | "proposeuser"
    | "proposeuserconfirm"
    | "proposeuserdecline"
    | "setuser"
    | "makemove"
    | "propose"
    | "getavailableplayers"
    | "test";
  values?: Record<string, string>;

  to?: string;
  from?: string;
};

export class Game {
  players: string[] = [];

  public Game() {}
}
