import WebSocket from "ws";

export type User = {
  userId: string;
  username?: string;
};

export type MessageClient = User & {
  socket: WebSocket;
};

export type Message = User & {
  command: "setuser" | "makemove";
  values?: Record<string, string>;
};
