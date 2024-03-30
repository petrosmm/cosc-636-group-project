import WebSocket, { WebSocketServer } from "ws";

import http from "http";

import { uuid } from "uuidv4";
// Spinning the HTTP server and the WebSocket server.
const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 8081;
server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
  console.log("hello23");
});

// I'm maintaining all active connections in this object
const clients = new Map<string, WebSocket>();

// A new client connection request received
wsServer.on("connection", function (connection) {
  // Generate a unique code for every user
  const userId = uuid();
  console.log(userId);
  console.log(`Received a new connection.`);

  // Store the new connection and handle messages
  clients.set(userId, connection);
  console.log(`User ${userId} connected.`);
  [...clients.entries()].forEach((p) => {
    // COSC-636-Group-project/frostburg-cosc6360-chess
    p[1].send("welcome");
  });
});
