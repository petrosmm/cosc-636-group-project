import WebSocket, { WebSocketServer } from "ws";
import http from "http";
import { uuid } from "uuidv4";
import { MessageClient, MessageUser } from "@lib/lib";

// Spinning the HTTP server and the WebSocket server.
const server = http.createServer();
const wssServer = new WebSocketServer({ server });
const port = 8081;
server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
  console.log("hello23");
});

// I'm maintaining all active connections in this object
const clients: MessageClient[] = [];

// A new client connection request received
wssServer.on("connection", function (connection) {
  console.log(`connection.url`, connection.url);
  // Generate a unique code for every user
  const userId = uuid();
  console.log(userId);
  console.log(`Received a new connection.`);

  // Store the new connection and handle messages
  clients.push({ userId: userId, socket: connection });

  console.log(`User ${userId} connected.`);
  let user: MessageUser = { userId: userId, value: userId };
  clients.find((p) => p.userId == userId)?.socket?.send(JSON.stringify(user));

  connection.on("message", function (event, isBinary) {
    let dataLessRaw = event?.toString();
    if (dataLessRaw?.length > 0) {
      try {
        let user = JSON.parse(event?.toString()) as MessageUser;
        console.log(user);
        if (user?.username != null) {
          let client = clients.find((p) => p.userId == user?.userId);
          if (client != null) {
            let _client = client;
            _client.username = user.username;
            let x = clients.findIndex((p) => p.userId == user.userId);
            delete clients[x];
            clients.push(_client);
          }

          console.log(clients);
        }
      } catch (ex) {
        console.log(ex);
      }
    }
  });
});
