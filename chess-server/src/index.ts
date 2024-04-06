import WebSocket, { WebSocketServer } from "ws";
import http from "http";
import { v4 } from "uuid";
import { Message, MessageClient, User } from "@lib/lib";
import { RawData } from "ws";

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

  const userId = v4();

  console.log(`User ${userId} connected.\r\n`);

  // Store the new connection and handle messages
  clients.push({ userId: userId, socket: connection });

  let userCurrent: User = { userId: userId };

  clients
    .find((p) => p.userId == userId)
    ?.socket?.send(JSON.stringify(userCurrent));

  connection.on("message", function (event, isBinary) {
    let dataLessRaw = event?.toString();
    if (dataLessRaw?.length > 0) {
      let messageIncoming = JSON.parse(event?.toString()) as Message;
      switch (messageIncoming.command) {
        case "setuser":
          addUsernameIfMissing(messageIncoming, clients);
          break;

        default:
          break;
      }
    }
  });
});

function addUsernameIfMissing(message: Message, clients: MessageClient[]) {
  try {
    console.log(`user`, message.userId, message.username);

    if (message?.username != null) {
      let client = clients.find(
        (p) => p.userId == message?.userId && p.username == null
      );
      if (client != null) {
        let _client = client;
        _client.username = message.username;

        let indexUser = clients.findIndex((p) => p.userId == message.userId);
        delete clients[indexUser];
        clients.push(_client);
      }

      // todo
    }
  } catch (ex) {
    console.log(ex);
  }
}
