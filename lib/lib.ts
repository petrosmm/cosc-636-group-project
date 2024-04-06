import WebSocket from "ws";

export type User = {
  userId: string;
  username?: string;
};

export type MessageClient = User & {
  socket: WebSocket;
};

export type Message = User & {
  command?: "setuser" | "makemove" | "propose" | "getavailableplayers";
  to?: string;
  from?: string;
  values?: Record<string, string>;
};

export class Game {
  players: string[] = [];

  public Game() {}
}
