import WebSocket from "ws";

export type MessageUser = {
  userId: string;
  username?: string;
  value: string;
};

export type MessageClient = {
  command?: "adduser" | "makemove";
  userId: string;
  username?: string;
  socket: WebSocket;
};

export {};
